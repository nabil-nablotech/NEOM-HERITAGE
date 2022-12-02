/**
 * custom service.
 */
 import * as fs from 'fs';
 import { stringify } from "csv-stringify";
 import { zip } from 'zip-a-folder';
 var AWS = require('aws-sdk');
 AWS.config.update(
  {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_SECRET,
  }
);
var s3 = new AWS.S3();

export const downloadFromS3 = async (pathToSave, mediaUrl) => {
  try {
    await s3.getObject(
      { Bucket: process.env.S3_BUCKET, Key: mediaUrl },
      function (error, data) {
        if (error != null) {
          console.log("Download Error At ===>", mediaUrl);
        } else {
          if(!fs.existsSync(`${pathToSave}${mediaUrl}`)){
            fs.writeFileSync(`${pathToSave}${mediaUrl}`,data.Body)
          }
        }
      }
    );
    return true
  } catch (err) {
    console.log("Download Error At ===>", mediaUrl);
    return err;
  }
}

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

const updateDataToDB = async(title, filePath, dataCount, fileCount, libraryCount, visitCount, id)=>{
  await strapi.query('api::download.download').update(
  {  where: {
    id:id
  },
    data:{
    title: title,
    filePath: filePath,
    dataCount: dataCount,
    fileCount: fileCount,
    libraryCount: libraryCount,
    visitCount: visitCount,
    status:'Completed'
  }});
}


  export const genratePlacesCSV = async (data: any, isAssets:string, id:string) => {
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
      await data[i].media_associates.forEach(async (data)=>{
        let mediaData = await getMediaById(data.id);
        let mediaUrl = mediaData?.object?.url?.split('/')[3];
        if(mediaData.media_type[0].categoryCode === 'LIBRARY'){
            libraryStringifier.write(mediaData);
            libraryCount=libraryCount+1;
        }else{
            mediaStringifier.write(mediaData);
            fileCount=fileCount+1;
        }
        if(isAssets==='true'){
          await downloadFromS3(`${dir}/assets/`, mediaUrl);
      }
    })
      await data[i].visit_associates.forEach(async(data)=>{
        let visitData = await getVisitById(data.id);
        visitStringifier.write(visitData);
        visitCount=visitCount+1
        if(isAssets==='true'){
            for(let k = 0; k < visitData.media_associates.length ;k++){
                let mediaData = await getMediaById(visitData.media_associates[k].id);
                let mediaUrl = mediaData?.object?.url?.split('/')[3];
                await downloadFromS3(`${dir}/assets/`, mediaUrl);
            }
        }
      })
    }
    await stringifier.pipe(writableStreamPlace);
    await libraryStringifier.pipe(writableStreamLibrary);
    await mediaStringifier.pipe(writableStreamMedia);
    await visitStringifier.pipe(writableStreamVisit);
    if(isAssets==='true'){
      await setTimeout(async function() {
        await zip(dir, `${dir}.zip`);
        await updateDataToDB("Places", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, id);
      }, 60000);
    }else{
      await zip(dir, `${dir}.zip`);
      await updateDataToDB("Places", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, id);
    }
    // await fs.rmSync(dir);
        return true;
    } catch (err) {
      console.log("error in getPlace function", err);
      return err;
    }
  }

  export const genrateEventsCSV = async (data: any, isAssets:string, id:string) => {
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
    await data.forEach(async(data)=>{
      stringifier.write(data);
      dataCount=dataCount+1;
      await data.media_associates.forEach(async (data)=>{
        let mediaData = await getMediaById(data.id);
        let mediaUrl = mediaData?.object?.url?.split('/')[3];
        if(mediaData.media_type[0].categoryCode === 'LIBRARY'){
            libraryStringifier.write(mediaData);
            libraryCount=libraryCount+1;
        }else{
            mediaStringifier.write(mediaData);
            fileCount=fileCount+1;
        }
        if(isAssets==='true'){
          await downloadFromS3(`${dir}/assets/`, mediaUrl);
        }
      })
    })
    await stringifier.pipe(writableStreamPlace);
    await libraryStringifier.pipe(writableStreamLibrary);
    await mediaStringifier.pipe(writableStreamMedia);
    if(isAssets==='true'){
        await setTimeout(async function() {
          await zip(dir, `${dir}.zip`);
          await updateDataToDB("Visit", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, id);
        }, 60000); 
    }else{
      await zip(dir, `${dir}.zip`);
      await updateDataToDB("Visit", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, id);
    }    
    return true;
    } catch (err) {
      console.log("error in getVisit function", err);
      return err;
    }
  }

  export const genrateMediaCSV = async (data: any, isAssets:string, id:string) => {
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

    await data.forEach(async (data)=>{
      stringifier.write(data);
      dataCount=dataCount+1;
    })
    await stringifier.pipe(writableStream);
    if(isAssets==='true'){
      await data.forEach(async (data)=>{
        let mediaLink = data.object?.url?.split('/')[3];
        await downloadFromS3(`${dir}/assets/`, mediaLink);
      })
      await setTimeout(async function() {
        await zip(dir, `${dir}.zip`);
        await updateDataToDB("Media", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, id);
      }, 60000);
    }else{
      await zip(dir, `${dir}.zip`);
      await updateDataToDB("Media", `${dir}.zip`.split("/public")[1], dataCount, fileCount, libraryCount, visitCount, id);
    }
        return true;
    } catch (err) {
      console.log("error in getVisit function", err);
      return err;
    }
  }