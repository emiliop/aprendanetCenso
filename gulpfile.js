/**
 * Created by IvanLamprea on 04/05/2016.
 */

'use strict';
/*Variables de Destinadas para plugins de Gulp*/
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    gutil = require('gulp-util'),
    recursive = require('recursive-readdir');

/*Variables destinadas para el core de Node*/
var through = require('through2'),
    fs = require('fs'),
    path = require('path');


gulp.task('browserSync', function(){
   browserSync.init({
     server: {
         baseDir: './'
     }
   });
});

gulp.task('sassTask', function () {
    return gulp.src('sass/**/*{.scss,sass}')
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(gulp.dest('css/'))
        .pipe(browserSync.reload({
            stream:true
        }));
});

gulp.task('watch',['browserSync','sassTask'], function () {
    gulp.watch('sass/**/*{.scss,sass}', ['sassTask']);
    gulp.watch('contents/**/*.html',browserSync.reload);
    gulp.watch('js/*.js',browserSync.reload);
    gulp.watch('structure.json',browserSync.reload);
    gulp.watch('index.html',browserSync.reload);
});


//Tarea Ivan Lamprea
gulp.task('GenerateFiles', function () {
    return gulp.src('./structure.json')
        .pipe(createFiles())
        .pipe(gulp.dest('dist/'));
});

gulp.task('AddFile', function () {
   return gulp.src('./structure.json')
       .pipe(addFile())
       .pipe(gulp.dest('contents/'));
});

gulp.task('RemoveFile',function () {
   return gulp.src('./structure.json')
       .pipe(removeFile())
       .pipe(gulp.dest('contents/'));
});

gulp.task('PreloadFile',function (){
   return gulp.src('./structure.json')
       .pipe(preloadFile(['./contents','./images','./audio','./fonts']))
       .pipe(gulp.dest('js/'));
});

gulp.task('Preload',['PreloadFile'],function(){
   transformPreload();
});

gulp.task('default',['watch']);

// Function for create files
function createFiles()
{
    return through.obj(function(file, enc, callback) {
        var opts,
            modal; /*Variables destinada para guardar la información del Archivo structure.json*/

        opts = JSON.parse(JSON.stringify(eval("("+file.contents.toString()+")")));

        for (var i = 0; i <= opts.slides.length - 1; i++)// Verifica cuantos Titulos o Temas hay!
        {
            if((opts.slides[i] > opts.prefabs[i].length))
                return console.error("ERROR: ¡Se definieron más campos en Slides que prefabs!, verifica tu archivo: 'structure.json'");

            for (var j = 1; j <= opts.slides[i]; j++) // Define un bucle por cada Tema para determinar cuantos slides contiene cada uno!
            {
                modal = opts.prefabs[i][j-1].split(" "); //Cada item de los subarrays de prefabs se va a definir en un arreglo

                if(modal.length > 1) // Si la longitud del arreglo es mayor a 1 quiere decir que ese item maneja ventanas emergentes
                    for(var k = 0; k < modal.length; k++)
                    {
                        if(k === 0) // Confirma que el primer elemento del array ("modal") no hace parte de las ventanas Emergentes
                            this.push(new gutil.File({
                                cwd: "",
                                base: "/",
                                path: "/contents/t" + i + "/t" + i + "_" + j + ".html",
                                contents: new Buffer(getDataFiles(modal[k], i, j, false, false)) /*params (file, theme, slide, modal)*/
                            }));
                        else
                            this.push(new gutil.File({
                                cwd: "",
                                base: "/",
                                path: "/contents/emergente/t" + i + "/t" + i + "_" + j + "" +String.fromCharCode(94+(k+2))+ ".html",
                                contents: new Buffer(getDataFiles(modal[k], i, j, true, false)) /*params (file,theme, slide, modal)*/
                            }));
                    }
                else
                    this.push(new gutil.File({
                        cwd: "",
                        base: "/",
                        path: "/contents/t" + i + "/t" + i + "_" + j + ".html",
                        contents: new Buffer(getDataFiles(opts.prefabs[i][j-1], i, j, false,false)) /*params (file, theme, slide)*/
                    }));
            }
        }
        console.log("Completed Files!");
    });
}


function addFile()
{
    return through.obj(function(file, enc,callback) {
        var opts,
            nameDirectory,
            newSlide,
            prefab,
            directory,
            directoryE,
            directoryI,
            directoryIE,
            modal;

        opts = JSON.parse(JSON.stringify(eval("("+file.contents.toString()+")")));

        prefab = opts.addSlides.prefab;
        newSlide =  opts.addSlides.newSlide;
        nameDirectory = opts.addSlides.directory;

        if (!fs.existsSync("./contents/"+nameDirectory))
            return console.error("ERROR: ¡El directorio no existe o no ha sido agregado!, verifica si ya se extrajo de la carpeta './dist' y verifica si existe en tu estructura de directorios");
        directory = fs.readdirSync("./contents/"+nameDirectory);
        if(newSlide > directory.length+1)
            return console.error("ERROR: ¡El nuevo slide no cumple la secuncia!, verifica tu archivo: 'structure.json'");
        else

            /********* El ciclo se encarga de correr todos los archivos un directorio **************/
            for(var j = directory.length; j>= newSlide; j--)
            {

                //--------------------- Contents

                var oldContent = fs.readFileSync("./contents/"+nameDirectory+"/"+nameDirectory+"_"+j+".html","utf8");
                var regExp = new RegExp(""+nameDirectory+"_"+j+"","g");
                var result = oldContent.replace(regExp,""+nameDirectory+"_"+(j+1)+"");
                fs.writeFileSync("./contents/"+nameDirectory+"/"+nameDirectory+"_"+j+".html", result, 'utf8');
                fs.renameSync("./contents/"+nameDirectory+"/"+nameDirectory+"_"+j+".html", "./contents/"+nameDirectory+"/"+nameDirectory+"_"+(j+1)+".html");

                //---------------------- Images Contents

                var imagefile = nameDirectory+"_"+ j,
                    oldimage = [],
                    newimage= [];

                if(fs.existsSync("./images/"+nameDirectory)) {
                    directoryI = fs.readdirSync("./images/"+nameDirectory);
                    //console.log(imagefile);
                    for(var k in directoryI)
                        if(directoryI[k].search(imagefile) === 0)
                            if(!parseInt(directoryI[k][imagefile.length]))
                                oldimage.push(directoryI[k]);
                            else
                                continue;
                        else
                            continue;
                    //console.log(oldimage);

                    for(var k in oldimage)
                        newimage.push(oldimage[k].replace(nameDirectory+"_"+j, nameDirectory+"_"+(j+1)));
                    //console.log(newimage);

                    for(var k in newimage)
                        fs.renameSync("./images/"+nameDirectory+"/"+oldimage[k], "./images/"+nameDirectory+"/"+newimage[k]);
                }



                //-----------------------Emergentes

                var fileE = nameDirectory+"_"+ j,
                    oldfileE = [],
                    newfileE = [];

                if(fs.existsSync("./contents/emergente/"+nameDirectory))
                {
                    directoryE = fs.readdirSync("./contents/emergente/"+nameDirectory);
                    //console.log(fileE);
                    for(var k in directoryE)
                        if(directoryE[k].search(fileE) === 0)
                            if(!parseInt(directoryE[k][fileE.length]))
                                oldfileE.push(directoryE[k]);
                            else
                                continue;
                        else
                            continue;
                    //console.log(oldfileE);

                    for(var k in oldfileE)
                        newfileE.push(oldfileE[k].replace(nameDirectory+"_"+j, nameDirectory+"_"+(j+1)));
                    //console.log(newfileE);

                    for(var k in newfileE)
                    {
                        var oldContent_E = fs.readFileSync("./contents/emergente/"+nameDirectory+"/"+oldfileE[k],"utf8");
                        var regExp_E = new RegExp(""+nameDirectory+"_"+j+"","g");
                        var result_E = oldContent_E.replace(regExp_E,""+nameDirectory+"_"+(j+1)+"");
                        fs.writeFileSync("./contents/emergente/"+nameDirectory+"/"+oldfileE[k], result_E, 'utf8');
                        fs.renameSync("./contents/emergente/"+nameDirectory+"/"+oldfileE[k], "./contents/emergente/"+nameDirectory+"/"+newfileE[k]);
                    }
                }


                //----------------------- Image Emergentes

                var imagefileE = nameDirectory+"_"+ j,
                    oldimageE = [],
                    newimageE= [];

                if(fs.existsSync("./images/emergente/"+nameDirectory)) {
                    directoryIE = fs.readdirSync("./images/emergente/"+nameDirectory);
                    //console.log(imagefileE);
                    for(var k in directoryIE)
                        if(directoryIE[k].search(imagefileE) === 0)
                            if(!parseInt(directoryIE[k][imagefileE.length]))
                                oldimageE.push(directoryIE[k]);
                            else
                                continue;
                        else
                            continue;
                    //console.log(oldimageE);

                    for(var k in oldimageE)
                        newimageE.push(oldimageE[k].replace(nameDirectory+"_"+j, nameDirectory+"_"+(j+1)));
                    //console.log(newimageE);

                    for(var k in newimageE)
                        fs.renameSync("./images/emergente/"+nameDirectory+"/"+oldimageE[k], "./images/emergente/"+nameDirectory+"/"+newimageE[k]);
                }
            }
        //*************** Se crea el nuevo archivo  ****************************//

        modal = prefab.split(" ");
        //console.log(modal);

        if(modal.length > 1) // Si la longitud del arreglo es mayor a 1 quiere decir que ese item maneja ventanas emergentes
            for(var k = 0; k < modal.length; k++)
            {
                if(k === 0) // Confirma que el primer elemento del array ("modal") no hace parte de las ventanas Emergentes
                    this.push(new gutil.File({
                        cwd: "",
                        base: "/contents",
                        path: "/contents/" + nameDirectory + "/" + nameDirectory + "_" + newSlide + ".html",
                        contents: new Buffer(getDataFiles(modal[k], nameDirectory.substring(1), newSlide, false, true )) /*params (file, theme, slide, modal)*/
                    }));
                else
                    this.push(new gutil.File({
                        cwd: "",
                        base: "/contents",
                        path: "/contents/emergente/" + nameDirectory + "/" + nameDirectory + "_" + newSlide +""+String.fromCharCode(94+(k+2))+".html",
                        contents: new Buffer(getDataFiles(modal[k], nameDirectory.substring(1), newSlide, true, true )) /*params (file, theme, slide, modal)*/
                    }));
            }
        else
            this.push(new gutil.File({
                cwd: "",
                base: "/contents",
                path: "/contents/" + nameDirectory + "/" + nameDirectory + "_" + newSlide + ".html",
                contents: new Buffer(getDataFiles(prefab, nameDirectory.substring(1), newSlide, false, true )) /*params (file, theme, slide, modal)*/
            }));

    });
}



function removeFile()
{
    return through.obj(function(file, enc, callback){
       var opts,
           nameDirectory,
           remSlide,
           directory,
           directoryE,
           directoryI,
           directoryIE;

        opts = JSON.parse(JSON.stringify(eval("("+file.contents.toString()+")")));
        nameDirectory = opts.removeSlides.directory;
        remSlide = parseInt(opts.removeSlides.remSlide);
        //console.log(nameDirectory +"_"+remSlide);

        if (!fs.existsSync("./contents/"+nameDirectory))
            return console.error("ERROR: ¡El directorio no existe o no ha sido agregado!, verifica si ya se extrajo de la carpeta './dist' y verifica si existe en tu estructura de directorios");
        directory = fs.readdirSync("./contents/"+nameDirectory);
        if(remSlide > directory.length+1)
            return console.error("ERROR: ¡El nuevo slide no cumple la secuncia!, verifica tu archivo: 'structure.json'");
        else
        {
            /************** Ciclo se encarga de correr todos los archivos *****************/

            for(var j = remSlide+1; j<= directory.length; j++ )
            {
                console.log(j);
                //---------------------------- Contents
                var oldContent = fs.readFileSync("./contents/"+nameDirectory+"/"+nameDirectory+"_"+j+".html","utf8");
                var regExp = new RegExp(""+nameDirectory+"_"+j+"","g");
                var result = oldContent.replace(regExp,""+nameDirectory+"_"+(j-1)+"");
                fs.writeFileSync("./contents/"+nameDirectory+"/"+nameDirectory+"_"+j+".html", result, 'utf8');
                fs.renameSync("./contents/"+nameDirectory+"/"+nameDirectory+"_"+j+".html", "./contents/"+nameDirectory+"/"+nameDirectory+"_"+(j-1)+".html");

                //----------------------------- Image Contents

                var imagefile = nameDirectory+"_"+ j,
                    oldimage = [],
                    newimage= [];

                if(fs.existsSync("./images/"+nameDirectory)) {
                    directoryI = fs.readdirSync("./images/"+nameDirectory);
                    //console.log(imagefile);
                    for(var k in directoryI)
                        if(directoryI[k].search(imagefile) === 0)
                            if(!parseInt(directoryI[k][imagefile.length]))
                                oldimage.push(directoryI[k]);
                            else
                                continue;
                        else
                            continue;
                    //console.log(oldimage);

                    for(var k in oldimage)
                        newimage.push(oldimage[k].replace(nameDirectory+"_"+j, nameDirectory+"_"+(j-1)));
                    //console.log(newimage);

                    for(var k in newimage)
                        fs.renameSync("./images/"+nameDirectory+"/"+oldimage[k], "./images/"+nameDirectory+"/"+newimage[k]);
                }

                //-----------------------Emergentes

                var fileE = nameDirectory+"_"+ j,
                    oldfileE = [],
                    newfileE = [];

                if(fs.existsSync("./contents/emergente/"+nameDirectory))
                {
                    directoryE = fs.readdirSync("./contents/emergente/"+nameDirectory);
                    //console.log(fileE);
                    for(var k in directoryE)
                        if(directoryE[k].search(fileE) === 0)
                            if(!parseInt(directoryE[k][fileE.length]))
                                oldfileE.push(directoryE[k]);
                            else
                                continue;
                        else
                            continue;
                    //console.log(oldfileE);

                    for(var k in oldfileE)
                        newfileE.push(oldfileE[k].replace(nameDirectory+"_"+j, nameDirectory+"_"+(j-1)));
                    //console.log(newfileE);

                    for(var k in newfileE)
                    {
                        var oldContent_E = fs.readFileSync("./contents/emergente/"+nameDirectory+"/"+oldfileE[k],"utf8");
                        var regExp_E = new RegExp(""+nameDirectory+"_"+j+"","g");
                        var result_E = oldContent_E.replace(regExp_E,""+nameDirectory+"_"+(j-1)+"");
                        fs.writeFileSync("./contents/emergente/"+nameDirectory+"/"+oldfileE[k], result_E, 'utf8');
                        fs.renameSync("./contents/emergente/"+nameDirectory+"/"+oldfileE[k], "./contents/emergente/"+nameDirectory+"/"+newfileE[k]);
                    }
                }


                //----------------------- Image Emergentes

                var imagefileE = nameDirectory+"_"+ j,
                    oldimageE = [],
                    newimageE= [];

                if(fs.existsSync("./images/emergente/"+nameDirectory)) {
                    directoryIE = fs.readdirSync("./images/emergente/"+nameDirectory);
                    //console.log(imagefileE);
                    for(var k in directoryIE)
                        if(directoryIE[k].search(imagefileE) === 0)
                            if(!parseInt(directoryIE[k][imagefileE.length]))
                                oldimageE.push(directoryIE[k]);
                            else
                                continue;
                        else
                            continue;
                    //console.log(oldimageE);

                    for(var k in oldimageE)
                        newimageE.push(oldimageE[k].replace(nameDirectory+"_"+j, nameDirectory+"_"+(j-1)));
                    //console.log(newimageE);

                    for(var k in newimageE)
                        fs.renameSync("./images/emergente/"+nameDirectory+"/"+oldimageE[k], "./images/emergente/"+nameDirectory+"/"+newimageE[k]);
                }
            }
        }


    });
}
function getDataFiles(file,theme,slide,modal,provideAddFile)
{
    //console.log(file+"_"+theme+"_"+slide+"_"+modal);
    var fileData,
        imgName = [],
        urlFileData = [],
        imgFileData = [],
        extFileData = [],
        regExp = /images\/(.*?.(jpe?g|png|svg|gif|bmp))/g,
        item;

    if(!fs.existsSync('./prefabs/'+file+'.html'))
       return console.error("ERROR: ¡El prefab '"+file+"' no existe!, verifica la carpeta './prefabs' o modifica tu archivo 'structure.json'");
    else
        fileData = fs.readFileSync('./prefabs/'+file+'.html', 'utf8');

    /*=========================================================================================================*/
    /*
     * Programacion Imagenes
     * */
    while(item = regExp.exec(fileData))
    {
        urlFileData.push(item[0]);
        imgFileData.push(item[1]);
        extFileData.push(item[2]);
    }

    for(var i = 0; i <= urlFileData.length-1; i++)
    {
        if(modal)
            imgName.push("images/emergente/t" + theme + "/t" + theme + "_" + slide + "" + String.fromCharCode(94+(i+3)) + "." +extFileData[i]);
        else
            imgName.push("images/t" + theme + "/t" + theme + "_" + slide + "" + String.fromCharCode(94+(i+3)) + "." +extFileData[i]);
    }

    for(var i = 0; i<= imgName.length-1; i++)
    {
        var newfileData = fileData.replace(urlFileData[i],imgName[i]);
        fileData = newfileData;
    }


    if (!fs.existsSync("./dist"))
        fs.mkdirSync("./dist");

    /*Creación de Directorios Contents*/

    if (!fs.existsSync("./dist/contents"))
        fs.mkdirSync("./dist/contents");


    if(!fs.existsSync("./dist/contents/t"+theme))
        fs.mkdirSync("./dist/contents/t"+theme);


    /*Creación de Directorios Imagenes*/


    if (!fs.existsSync("./dist/images"))
        fs.mkdirSync("./dist/images");

    if(!fs.existsSync("./dist/images/t"+theme))
        fs.mkdirSync("./dist/images/t"+theme);



    if(modal)
    {
        // Creación de Directorios Contents Emergentes
        if (!fs.existsSync("./dist/contents/emergente"))
            fs.mkdirSync("./dist/contents/emergente");

        if(!fs.existsSync("./dist/contents/emergente/t"+theme))
            fs.mkdirSync("./dist/contents/emergente/t"+theme);



        // Creación de Directorios Imagenes Emergentes

        if (!fs.existsSync("./dist/images/emergente"))
            fs.mkdirSync("./dist/images/emergente");

        if(!fs.existsSync("./dist/images/emergente/t"+theme))
            fs.mkdirSync("./dist/images/emergente/t"+theme);

    }

    if(provideAddFile)
    {
        if (!fs.existsSync("./contents/emergente"))
            fs.mkdirSync("./contents/emergente");

        if(!fs.existsSync("./contents/emergente/t"+theme))
            fs.mkdirSync("./contents/emergente/t"+theme);

        if (!fs.existsSync("./images/emergente"))
            fs.mkdirSync("./images/emergente");

        if(!fs.existsSync("./images/emergente/t"+theme))
            fs.mkdirSync("./images/emergente/t"+theme);
    }

    for(var i = 0; i<= imgName.length-1; i++)
    {
        if(provideAddFile)
            fs.createReadStream('./prefabs/images/'+imgFileData[i]).pipe(fs.createWriteStream("./"+imgName[i]));
        else
            fs.createReadStream('./prefabs/images/'+imgFileData[i]).pipe(fs.createWriteStream("./dist/"+imgName[i]));
    }

    return fileData;
}

// Function for create preload

function preloadFile(Directories)
{
    return through.obj(function(file,enc,callback){
        this.push(new gutil.File({
            cwd: "",
            base: "/js",
            path: "/js/preload.js",
            contents: new Buffer(getUrl(Directories))
        }));
        callback();
    });

}

function transformPreload()
{
    var head = "var imagesArray = [";
    var footer = "'];";

    var oldContent = fs.readFileSync("./js/preload.js","utf8"),
    result = oldContent.replace(/\.\//g,"'"),
    body = result.replace(/,/g,"',");

    fs.writeFileSync("./js/preload.js",(head+body+footer), 'utf8');
}

function getUrl(arrayDir)
{
    var results = [],
        list;

    for(var index in arrayDir){
        list = fs.readdirSync(arrayDir[index]);
        list.forEach(function(file) {
            file = arrayDir[index] + '/' + file;
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory())
                {
                    results = results.concat(getUrl([file]));

                }
            else results.push(file);
        });
    }
    return results.toString();
}

