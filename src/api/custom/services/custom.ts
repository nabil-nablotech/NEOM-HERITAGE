/**
 * custom service.
 */
 import * as fs from 'fs';
 import { stringify } from "csv-stringify";
 import { zip } from 'zip-a-folder';

export default () => ({});
export const getMediaById = async (id: number) => {
    try {
      return await strapi.query("api::media.media").findOne({
        populate: {
          object: {
            populate: {
              fileUrl: true,
            },
          },
          media_type: true
        },
        where: {
          media_associate: id
        },
      });
    } catch (err) {
      console.log("error in getMedia function", err);
      return err;
    }
  }

  export const getVisitById = async (id: number) => {
    try {
      return await strapi.query("api::visit.visit").findOne({
        populate: {
            media_associates: true
          },
        where: {
          visit_associate: id
        },
      });
    } catch (err) {
      console.log("error in getVisit function", err);
      return err;
    }
  }

const insertDataToDB = async(title, filePath, dataCount, fileCount, libraryCount, visitCount, token)=>{
  await strapi.query('api::download.download').create(
  {data:{
    title: title,
    filePath: filePath,
    dataCount: dataCount,
    fileCount: fileCount,
    libraryCount: libraryCount,
    visitCount: visitCount,
    token:token
  }});
}


  export const genratePlacesCSV = async (data: any, isAssets:string, token:string) => {
    try {
      var dir = `./public/downloads/places_${Date.now()}`
      var dataCount=0;
      var fileCount=0;
      var libraryCount=0;
      var visitCount=0;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        if(isAssets==='true'){
            fs.mkdirSync(`${dir}/assets`);
        }
      }
    const writableStreamPlace = fs.createWriteStream(`${dir}/places_${Date.now()}.csv`);
    const writableStreamLibrary = fs.createWriteStream(`${dir}/library_${Date.now()}.csv`);
    const writableStreamMedia = fs.createWriteStream(`${dir}/media_${Date.now()}.csv`);
    const writableStreamVisit = fs.createWriteStream(`${dir}/visit_${Date.now()}.csv`);
    const placesFields = Object.keys(data[0]);
    const mediaFields = ['id','uniqueId','bearing','description','title','fileName','longitude','latitude','createdAt','updatedAt','featuredImage',
    'objectURL','referenceURL','citation','mediaUIPath','deleted','Author','categoryType','keywords','videoType','object'];
    const visitFields = ['id', 'visitDate','recordingTeam','visitNumber','fieldNarrative','createdAt','updatedAt','uniqueId','siteDescription','latitude',
      'longitude','deleted','visitUIPath','siteType','researchValue','artifacts','tourismValue','stateOfConservation','recommendation','risk',
      'period','assessmentType','keywords'];
    const stringifier = stringify({ header: true, columns: placesFields });
    const libraryStringifier = stringify({ header: true, columns: mediaFields });
    const mediaStringifier = stringify({ header: true, columns: mediaFields });
    const visitStringifier = stringify({ header: true, columns: visitFields });
    for (let i = 0; i < data.length; i++) {
      stringifier.write(data[i]);
      dataCount=dataCount+1;
      //media associate
      for (let j = 0; j < data[i].media_associates.length; j++) {
        let mediaData = await getMediaById(data[i].media_associates[j].id);
        let mediaUrl = mediaData.object.url;
        if(mediaData.media_type[0].categoryCode === 'LIBRARY'){
            libraryStringifier.write(mediaData);
            libraryCount=libraryCount+1;
        }else{
            mediaStringifier.write(mediaData);
            fileCount=fileCount+1;
        }
        if(isAssets==='true' && fs.existsSync(`./public${mediaUrl}`)){
          fs.copyFile(`./public${mediaUrl}`, `${dir}/assets/${mediaUrl.replaceAll('/uploads/','')}`, (err) => {
          if (err) 
            throw err;
          });
      }
      }
      //visit associate
      for (let j = 0; j < data[i].visit_associates.length; j++) {
        let visitData = await getVisitById(data[i].visit_associates[j].id);
        visitStringifier.write(visitData);
        visitCount=visitCount+1
        if(isAssets==='true'){
            for(let k = 0; k < visitData.media_associates.length ;k++){
                let mediaData = await getMediaById(visitData.media_associates[k].id);
                let mediaUrl = mediaData.object.url;
                  if(fs.existsSync(`./public${mediaUrl}`)){
                    fs.copyFile(`./public${mediaUrl}`, `${dir}/assets/${mediaUrl.replaceAll('/uploads/','')}`, (err) => {
                    if (err) 
                      throw err;
                    });
                }
            }
        }
      }
    }
    await stringifier.pipe(writableStreamPlace);
    await libraryStringifier.pipe(writableStreamLibrary);
    await mediaStringifier.pipe(writableStreamMedia);
    await visitStringifier.pipe(writableStreamVisit);
    await zip(dir, `${dir}.zip`);

    //inserting into data base
    await insertDataToDB("Places", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, token);

    // await fs.rmSync(dir);
        return true;
    } catch (err) {
      console.log("error in getPlace function", err);
      return err;
    }
  }

  export const genrateEventsCSV = async (data: any, isAssets:string, token:string) => {
    try {
      var dir = `./public/downloads/visits_${Date.now()}`
      var dataCount=0;
      var fileCount=0;
      var libraryCount=0;
      var visitCount=0;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        if(isAssets==='true'){
            fs.mkdirSync(`${dir}/assets`);
        }
      }
    const writableStreamPlace = fs.createWriteStream(`${dir}/visits_${Date.now()}.csv`);
    const writableStreamLibrary = fs.createWriteStream(`${dir}/library_${Date.now()}.csv`);
    const writableStreamMedia = fs.createWriteStream(`${dir}/media_${Date.now()}.csv`);
    const eventsFields = Object.keys(data[0]);
    const mediaFields = ['id','uniqueId','bearing','description','title','fileName','longitude','latitude','createdAt','updatedAt','featuredImage',
    'objectURL','referenceURL','citation','mediaUIPath','deleted','Author','categoryType','keywords','videoType','object'];
    const stringifier = stringify({ header: true, columns: eventsFields });
    const libraryStringifier = stringify({ header: true, columns: mediaFields });
    const mediaStringifier = stringify({ header: true, columns: mediaFields });
    for (let i = 0; i < data.length; i++) {
      stringifier.write(data[i]);
      dataCount=dataCount+1;
      for (let j = 0; j < data[i].media_associates.length; j++) {
        let mediaData = await getMediaById(data[i].media_associates[j].id);
        let mediaUrl = mediaData.object.url;
        if(mediaData.media_type[0].categoryCode === 'LIBRARY'){
            libraryStringifier.write(mediaData);
            libraryCount=libraryCount+1;
        }else{
            mediaStringifier.write(mediaData);
            fileCount=fileCount+1;
        }
        if(isAssets==='true' && fs.existsSync(`./public${mediaUrl}`)){
          fs.copyFile(`./public${mediaUrl}`, `${dir}/assets/${mediaUrl.replaceAll('/uploads/','')}`, (err) => {
          if (err) 
            throw err;
          });
        }
      }
    }
    await stringifier.pipe(writableStreamPlace);
    await libraryStringifier.pipe(writableStreamLibrary);
    await mediaStringifier.pipe(writableStreamMedia);
    await zip(dir, `${dir}.zip`);
    await insertDataToDB("Visit", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, token);
    return true;
    } catch (err) {
      console.log("error in getVisit function", err);
      return err;
    }
  }

  export const genrateMediaCSV = async (data: any, isAssets:string, token:string) => {
    try {
      var dir = `./public/downloads/media_${Date.now()}`
      var dataCount=0;
      var fileCount=0;
      var libraryCount=0;
      var visitCount=0;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        if(isAssets==='true'){
            fs.mkdirSync(`${dir}/assets`);
        }
      }

    const writableStream = fs.createWriteStream(`${dir}/media_${Date.now()}.csv`);
    const fields = Object.keys(data[0]);
    const stringifier = stringify({ header: true, columns: fields });

    for (let i = 0; i < data.length; i++) {
      stringifier.write(data[i]);
      dataCount=dataCount+1;
    }
    await stringifier.pipe(writableStream);
    
    if(isAssets==='true'){
      for (let i = 0; i < data.length; i++) {
        let mediaLink = data[i].object.url;
        if(fs.existsSync(`./public/${mediaLink}`)){
            fs.copyFile(`./public/${mediaLink}`, `${dir}/assets/${mediaLink.replaceAll("/uploads","")}`, (err) => {
                if (err) 
                    throw err;
                });
        }
      }
    }
        await zip(dir, `${dir}.zip`);
        await insertDataToDB("Media", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, token);
        return true;
    } catch (err) {
      console.log("error in getVisit function", err);
      return err;
    }
  }