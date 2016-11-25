var app = {
    //Constructor básico de phonegap.
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
        docenteApp.inicializar();
    }
}; 

var docenteApp = ( function(){
var server = "";
var deviceType;
var store;
var pictureSource; 
var destinationType; 
var docente;
var videoData = {};
var comunicados = [];
var comunicadosMostrados = 0;

var getPhotoSuccess = function(imageURI) {
//Si la selección de la foto fue exitosa, se retorna esta función.
//La imagen se carga en #image.
//imageURI es el parámetro dónde obtenemos la ruta de la 
//imagen en el móvil.
    $("#image").css("display", "block");
    if (deviceType === "iOS"){
         $("#image").attr("src", imageURI);
    }
    else{
        //En caso de ser una versión menor a 5 de Android, 
        //se trata la imagen de una manera diferente.
        var versionNum = parseInt(device.version.charAt(0));
        if (versionNum >= 5){
            $("#image").attr("src", imageURI);
        }
        else{
            var imgContenido = "data:image/jpeg;base64," + imageURI;
            $("#image").attr("src", imgContenido);
        }
        
    }
    var f = imagenForm();
    $("#imagenInfoForm").html(f);    
    $("#textarea-imagen-nombre").textinput();     
    $("#textarea-imagen-descripcion").textinput();  
    $("#formularioDatosImagen").css("display", "block");
     $('#btnUploadImagen').css("display","block");
     getAlumnosFromClase("#alumnosListImagen");
};

//Crea un formulario de imagen.
var imagenForm = function(){
    var f = "<form>";
    f += "<label for='textarea-imagen-nombre'>Nombre</label>";
    f += "<input type=\"text\" name=\"textarea-imagen-nombre\" id=\"textarea-imagen-nombre\" value=\"\" data-clear-btn=\"true\">";     
    f += "<label for='textarea-imagen-descripcion'>Descripción</label>";
    f += "<textarea name='textarea-imagen-descripcion' id='textarea-imagen-descripcion'></textarea>";
    f += "</form>";
    return f;
};

//Alerta un error en caso de que la búsqueda de fotos sea fallida.
var getPhotoFail = function(message) {
};

//Si la toma de foto fue exitosa, se retorna esta función.
//La imagen se carga en #image.
//imageURI es el parámetro dónde obtenemos la ruta de la 
//imagen en el móvil.
var capturePhotoSuccess = function(imageURI) {
    $("#image").css("display", "block");
    $("#image").attr("src", imageURI);
    var f = imagenForm();
    $("#imagenInfoForm").html(f);  
    $("#textarea-imagen-nombre").textinput(); 
    $("#textarea-imagen-descripcion").textinput();        
    $("#formularioDatosImagen").css("display", "block");
     $('#btnUploadImagen').css("display","block");
     getAlumnosFromClase("#alumnosListImagen");
};

//Alerta un error en caso de que la captura de fotos sea fallida.
var capturePhotoFail = function(message){
};

//Chequea que los campos obligatorios sean ingresados.
var checkInfoImagen = function(){
    var ok = true;
    if ($('#textarea-imagen-nombre').val() === ""){
        ok = false;
    }
    if ($("#alumnosListImagen").val() === null){
        ok = false;
    }
    return ok;
};

//Descripción: Llamado cuando uploadImagen fue exitoso.
var uploadImagenSuccess = function(r){
    var galleryImage = document.getElementById('image');
    galleryImage.style.display = 'none';
    galleryImage.src = "";
    $("#imagenInfoForm").html("");    
    $("#formularioDatosImagen").css("display", "none");  
    $('#btnUploadImagen').css("display","none");
    $("#alumnosListImagen").html(""); 
    $('#imagenesPanel').css("display", "none");

};

var uploadImagenFail = function(message){
};

//Chequea que los campos obligatorios sean ingresados.
var checkInfoVideo = function(){
    var ok = true;
    if ($('#textarea-video-nombre').val() === ""){
        ok = false;
    }
    if ($("#alumnosListVideo").val() === null){
        ok = false;
    }
    return ok;
};

//Descripción: Llamado cuando uploadVideo fue exitoso.
var uploadVideoSuccess = function(r){
    $("#videoArea").html("");
    $("#videoInfoForm").html("");
    $("#formularioDatosVideo").css("display", "none");
    $("#btnUploadVideo").css("display", "none");
    $("#alumnosListVideo").html("");
    $('.videoSlider').html(""); 
    $('#videosPanel').css("display", "none");
    $("#esperarModal").css("display", "none");
};

//En caso de fallar la subida de video.
var uploadVideoFail = function(message){
    alert('Falla en la subida de video. Motivo: ' + message);
    $("#esperarModal").css("display", "none");
};

//Falla en la captura de video.
var captureVideoFail = function(e) {

};

//La captura es exitosa
var captureVideoSuccess = function(s) {
    loadVideo(s[0].fullPath);
};

//Si la selección del video fue exitosa, se retorna esta función.
var getVideoSuccess = function(videoURI) {
    loadVideo(videoURI);
};

//La selección del video falla y se retorna esta función.
var getVideoFail = function(message){

};

//Se inyecta el elemento <video> en videoArea. 
//El source del video lo obtenemos de videoURI
var loadVideo = function(videoReference){
    var v = "<video controls='controls'  width=\"320\" height=\"240\">";
        v += "<source id='videoup' src='" + videoReference + "' type='video/mp4'>";
        v += "</video>";
    $("#videoArea").html(v);
    var f = "<form>";
    f +=        "<label for='textarea-video-nombre'>Nombre</label>";
    f += "<input type=\"text\" name=\"textarea-video-nombre\" id=\"textarea-video-nombre\" value=\"\" data-clear-btn=\"true\">";
    f +=        "<label for='textarea-video-descripcion'>Descripción</label>";
    f +=        "<textarea name='textarea-video-descripcion' id='textarea-video-descripcion'></textarea>";
    f +=    "</form>";                  
    $("#videoInfoForm").html(f);
    $("#textarea-video-nombre").textinput();    
    $("#textarea-video-descripcion").textinput();   
    $("#formularioDatosVideo").css("display", "block");
    $("#btnUploadVideo").css("display", "block");
    getAlumnosFromClase("#alumnosListVideo");
};

//Esta función carga la lista de alumnos disponibles para una clase determinada, con el 
//fin de que el docente pueda seleccionar a cual corresponde asociarlo.
//Recibe como parámetro el id del elemento del DOM donde se insertará.
var getAlumnosFromClase = function(idListHtml){
    $.getJSON( server+"/alumnosDeClase/"+$("#clasesDocenteList").val(), function( data ) {
        var listAlumnosHTML = "";
        $.each( data, function( key, val ) {
            listAlumnosHTML += "<option selected=\"selected\" value="+val._id+">"+val.nombres+" "+val.apellidos+"</option>";

        });
        $(idListHtml).html(listAlumnosHTML);
        $(idListHtml).selectmenu("refresh");

    }).fail(function(jqXHR, textStatus, errorThrown) {
        docenteApp.irAPaginaError();
    });
};
//Si ya existe el archivo lo muestra para reproducir.
var checkAndLoadFile = function(ruta, clave){ 
    console.log("Si ya existe el archivo lo muestra para reproducir");
    console.log(ruta);
    var v = "";
    if (deviceType === "iOS"){
        v += "<video width=\"100%\" height=\"auto\" autoplay controls='controls'>";
    }    
    else if (deviceType === "Android"){
         var ext = ruta.split('.').pop();
                if (ext === "MOV"){
                    v += "<video width=\"100%\" class='video-js' height=\"auto\" autoplay controls preload='auto' data-setup=\"{}\">";
                }
                else{
                    v += "<video width=\"100%\" height=\"auto\" autoplay controls='controls'>";
                }
    }
        v += "<source id='videoup' src='" + ruta + "' type='video/mp4'>";
        v += "</video>";
        v += "<p>Título: "+videoData[clave].nombre+"</p>";
        v += "<p>Descripción: "+videoData[clave].descripcion+"</p>";
    $("#verVideo").html(v);
    $("video").focus();
};

//Si no existe el archivo, primero lo descargo del servidor.
var downloadFileAndLoad = function(nombreArchivo, clave){
    $("#esperarModalContenidosMensaje").html("Descargando...");
    $("#esperarModalContenidos").css("display", "block");
    var fileTransfer = new FileTransfer();
    var uri = encodeURI(server+"/"+nombreArchivo);
    var fileURL = store + nombreArchivo;
    fileTransfer.download(
        uri,
        fileURL,
        function(entry) {
            var v = "";
            if (deviceType === "iOS"){
                v += "<video width=\"100%\" height=\"auto\" autoplay controls='controls'>";
            }  
            else if (deviceType === "Android"){
                var ext = nombreArchivo.split('.').pop();
                if (ext === "MOV"){
                    v += "<video width=\"100%\" class='video-js' height=\"auto\" autoplay controls preload='auto' data-setup=\"{}\">";
                }
                else{
                    v += "<video width=\"100%\" height=\"auto\" autoplay controls='controls'>";
                }
            }            
            v += "<source id='videoup' src='" + fileURL + "' type='video/mp4'>";
            v += "</video>";
            v += "<p>Título: "+videoData[clave].nombre+"</p>";
            v += "<p>Descripción: "+videoData[clave].descripcion+"</p>";
            $("#verVideo").html(v);
            $("#esperarModalContenidos").css("display", "none");
            $("video").focus();
        },
        function(error) {
            $("#esperarModalContenidosMensaje").html("Error en la descarga.");
        },
        false,
        {
            headers: {

            }
        }
    ); 
};

//Convierte un string con fecha UTC en un string del formato dd/mm/yyyy, 
//teniendo en cuenta la zona horaria
var convertirFecha = function (fechaDelServidor){
    var d = new Date(fechaDelServidor);
    var anio = d.getFullYear();
    var mes = d.getMonth() + 1;  //los meses comienzan en cero
    var dia = d.getDate();

    if(dia < 10){
        dia = "0" + dia;
    }
    if(mes < 10){
        mes = "0" + mes;
    }

    return dia + "/" + mes + "/" + anio;
};


//API DOCENTE MOLINETE
return {

//Inicializa todas las componentes de la aplicación.
inicializar :function(){
    $.getJSON("js/conf.json", function(result){
        $.getJSON(result.host, function(result1){
            //Pido el servidor.
            server = result1.host;
            deviceType = device.platform;
            if (deviceType === "iOS"){
                store = cordova.file.documentsDirectory;
            }
            else if (deviceType === "Android"){
                store = cordova.file.externalDataDirectory;
            }
            pictureSource = navigator.camera.PictureSourceType;
            destinationType = navigator.camera.DestinationType;
            $.get( server+"/checkAuth/docentes/"+device.uuid, function( data ) {
                if (data === 'noautorizado'){
                    $(':mobile-pagecontainer').pagecontainer('change', '#login', {
                        transition: 'flip', 
                        changeHash: false,
                        reverse: true,
                        showLoadMsg: true
                    });
                }
                else{
                    $.getJSON( server+"/docenteMovilId/"+device.uuid, function( data ) {
                        docente = data;
                        $("#mainTitle").html(data.nombres + " " + data.apellidos); 
                        $.getJSON( server+"/clasesDelDocente/"+data._id, function( data0 ) {
                            var clasesDocenteListHTML = ""; 
                            $.each( data0, function( key, val ) {
                                clasesDocenteListHTML += "<option  value='"+val._id+"'>"+val.nombre+"</option>";
                            });
                            $("#clasesDocenteList").html(clasesDocenteListHTML); 
                            $("#clasesDocenteList").selectmenu("refresh");
                            docenteApp.refreshAlumnosGeneral();
                        });  
                    });               
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                docenteApp.irAPaginaError();
            });
        });
    });
},

//Inicializa las clases del docente.
inicializarDocente: function(){
    //Pide el docente.
    $.getJSON( server+"/docenteMovilId/"+device.uuid, function( data ) {
        docente = data;
        $("#mainTitle").html(data.nombres +" "+ data.apellidos);
        //Pide las clases del docente.
        $.getJSON( server+"/clasesDelDocente/"+data._id, function( data0 ) {
            var clasesDocenteListHTML = ""; 
            $.each( data0, function( key, val ) {
                clasesDocenteListHTML += "<option  value='"+val._id+"'>"+val.nombre+"</option>";
            }); 
            $("#clasesDocenteList").html(clasesDocenteListHTML);
            $("#clasesDocenteList").selectmenu("refresh");
            docenteApp.refreshAlumnosGeneral();
        });

    }).fail(function(jqXHR, textStatus, errorThrown) {
        docenteApp.irAPaginaError();
    });
},

//Inicializa los paneles html.
empezar: function() {
    $('#comunicadosPanel').css("display", "none");
    $('#imagenPanel').css("display", "none");
    $('#videosPanel').css("display", "none");

    $("#verVideo").empty();
    $("#comunicadosPagina").empty();
},

//Realiza el chequeo de credenciales.
ingresar: function(){

    var error = false;
    var ci = $("#cidocente").val();
    var codigo = $("#code").val();
    if (ci === '' || ci === null){
        $("#cidocenteerror").val("Debe ingresar este campo.");
        error = true;
    }
    if (codigo === '' || codigo === null){
        $("#codeerror").val("Debe ingresar este campo.");
        error = true;
    }
    //Si no hay ausencia de campos chequea en el servidor la correctitud.
    if (!error){
        $.get( server+"/ingresar/docentes/"+ci+"/"+device.uuid+"/"+codigo, function( data ) {
            //Si el servidor responde afirmativamente.
            if (data === 'ok'){
                docenteApp.inicializarDocente();
                $(':mobile-pagecontainer').pagecontainer('change', '#docenteGeneral', {
                    transition: 'flip',
                    changeHash: false,
                    reverse: true,
                    showLoadMsg: true 
                });
            }

        }).fail(function(jqXHR, textStatus, errorThrown) {

            if(jqXHR.status == 500) {
                $(':mobile-pagecontainer').pagecontainer('change', '#loginError', {
                    transition: 'flip',
                    changeHash: false,
                    reverse: true,
                    showLoadMsg: true
                });
            } else {
                docenteApp.irAPaginaError();
            }
        });
    }
},

// Obtiene una foto almacenada en el dispositivo y la almacena en
//base64-enconded sólo para el caso de Android anteriores a Lollipop.
getPhoto: function() {
  if (deviceType === "iOS"){
    navigator.camera.getPicture(getPhotoSuccess, getPhotoFail, { 
    quality: 50, 
    targetWidth: 600,
    targetHeight: 600,
    destinationType: navigator.camera.DestinationType.FILE_URI,
    sourceType: pictureSource.SAVEDPHOTOALBUM });
  }
  else {
        //En caso de ser Android debemos discriminar las versiones
        //anteriores y posteriones a la 5
        var versionNum = parseInt(device.version.charAt(0));
        var destinationTypeAndroid = navigator.camera.DestinationType.FILE_URI;
        if (versionNum < 5){
            destinationTypeAndroid = navigator.camera.DestinationType.DATA_URL;
        }
        navigator.camera.getPicture(getPhotoSuccess, getPhotoFail, { 
            quality: 50,
            targetWidth: 600,
            targetHeight: 600,
            destinationType: destinationTypeAndroid, 
            sourceType: pictureSource.PHOTOLIBRARY,
            correctOrientation : true
        });
    }
},

//Toma la foto usando la cámara del dispotivo y la retorna como una imagen
//Si es un caso de éxito llama a onPhotoDataSuccess, en caso contrario,
//llama a onFail.
capturePhoto: function() {

    if (deviceType === "iOS"){
        navigator.camera.getPicture(capturePhotoSuccess, capturePhotoFail, {
            quality: 30,
            targetWidth: 600,
            targetHeight: 600,
            destinationType: destinationType.FILE_URI,
            saveToPhotoAlbum: true
        });
    }
    else{
         navigator.camera.getPicture(capturePhotoSuccess, capturePhotoFail, {
            quality: 30,
            targetWidth: 600,
            targetHeight: 600,
            destinationType: destinationType.FILE_URI,
            correctOrientation : true,
            saveToPhotoAlbum: true
        });       
    }
},

//Descripción: Esta función es utilizada para subir las imágenes.
//Pido el área donde está la imagen.
uploadImagen: function() {
    //Pido el "source" de la imagen. Notar que en las funciones
    //capturePhotoSuccess y getPhotoSuccess se carga el source
    var imageURI = $("#image").attr("src");
    if (deviceType === "Android"){
        var imageURISplit = imageURI.split("?");
        if (imageURISplit.length > 0){
            imageURI = imageURISplit[0];
        }
    }
    //Creo las opciones. Es parte de FileTransfer.
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    //Dentro de las opciones puedo agregar parámetros, los cuáles viajan 
    //en el body del post en formato json.
    if (checkInfoImagen()){
        var params = {};
        params.docente = device.uuid;
        params.descripcion = $('#textarea-imagen-descripcion').val();
        params.nombre = $('#textarea-imagen-nombre').val(); //Nombre fantasía (no es el nombre del archivo)
        params.alumnos = $("#alumnosListImagen").val().toString(); //&deteccion de error. 
        params.tipo = "Imagen";
        params.docenteId = docente._id;
        params.validado = docente.permisoPublicar;
        params.rechazado = false;
        options.params = params;
        options.chunkedMode = false;
        //Creo la variable que hara la transferencia y realizo el upload.
        var ft = new FileTransfer();
        ft.upload(imageURI, server+"/subirImagen", uploadImagenSuccess, uploadImagenFail,
            options);
    }
    else{
        alert('Hay campos incompletos');
    }
},

//Busca el video en el dispositivo.    
//Si es un caso de éxito llama a onVideoURISuccess, en caso contrario,
//llama a onFail.
getVideo: function(){
    if (deviceType === "iOS"){
        navigator.camera.getPicture(getVideoSuccess, getVideoFail, {
            destinationType: destinationType.FILE_URI,
            sourceType: pictureSource.PHOTOLIBRARY, 
            mediaType: 1
        });
    }
    else{
        navigator.camera.getPicture(getVideoSuccess, getVideoFail, {
            destinationType: destinationType.FILE_URI,
            sourceType: pictureSource.PHOTOLIBRARY, 
            mediaType: 1
        });
    }
},

//Abre la cámara para filmar un video.
captureVideo: function(){
   navigator.device.capture.captureVideo(captureVideoSuccess, captureVideoFail, {limit: 1});
},

//Descripción: Esta función es utilizada para subir un video.
//Pido el sector del DOM donde se encuentra el video.
//var img = document.getElementById('videoup');
uploadVideo: function() {
    //Pido el source del video.
    var imageURI = $("#videoup").attr("src");
    if (checkInfoVideo()){
        //Inicializo las options del FileUpload.
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "video/mp4";
        //Le agregamos parametros al post que viajan en el body 
        //en formato JSON
        var params = {};
        options.params = params;
        params.tipo = "Video";
        params.docente = device.uuid;
        params.docenteId = docente._id;
        params.validado = docente.permisoPublicar;
        params.descripcion = $('#textarea-video-descripcion').val();
        params.nombre = $('#textarea-video-nombre').val();
        params.alumnos = $("#alumnosListVideo").val().toString();
        options.chunkedMode = false;
        //Realizamos la transferencia.
        var ft = new FileTransfer();
        $("#esperarModalMensaje").html("Subiendo el contenido...");
        $("#esperarModal").css("display", "block");
        ft.upload(imageURI, server+"/subirVideo", uploadVideoSuccess, uploadVideoFail,
            options);
    }
    else{
        alert('Hay campos incompletos');
    }
},

//Se carga en cada lugar donde se necesita ver los alumnos.    
//Se pide la lista de alumnos para una determinada clase al servidor.
refreshAlumnosGeneral: function(){
    alumnosDeClaseActual = "";
    $.getJSON( server+"/alumnosDeClase/"+$("#clasesDocenteList").val(), function( data ) {
        alumnosDeClaseActual = "";
        $.each( data, function( key, val ) {
            alumnosDeClaseActual += "<option selected=\"selected\" value="+val._id+">"+val.nombres+" "+val.apellidos+"</option>";
        });
        if ($("#alumnosListVideo").html() !== ""){
            $("#alumnosListVideo").html(alumnosDeClaseActual);
            $("#alumnosListVideo").selectmenu("refresh");
        }
        if ($("#alumnosListImagen").html() !== ""){
            $("#alumnosListImagen").html(alumnosDeClaseActual);
            $("#alumnosListImagen").selectmenu("refresh");
        }
        $("#alumnosListComunicado").html(alumnosDeClaseActual);
        $("#alumnosListComunicado").selectmenu("refresh");

    }).fail(function(jqXHR, textStatus, errorThrown) {
        docenteApp.irAPaginaError();
    });     
},

//Envía el comunicado al servidor.
sendComunicado: function(){
    var titulo = $("#comunicadoTitle").val();
    var cuerpo = encodeURIComponent($("#comunicadoContent").val());
    if (titulo !== "" && cuerpo !== "" && $("#alumnosListComunicado").val() !== null){
        var dataSend = {"docente" : device.uuid, "titulo" : titulo, "cuerpo" : cuerpo, "docenteId" : docente._id, "validado" : docente.permisoPublicar,
             "alumnos" : $("#alumnosListComunicado").val().toString()};
        var url = server+"/subirComunicado";
        $.post(url, dataSend,'json');
        $("#comunicadoTitle").val("");
        $("#comunicadoContent").val("");
    }
    else{
        alert("Falta información");
    } 
},

//Carga los videos del docente en la sección de contenidos.
loadVideosDocente: function(){
    $('#imagenPanel').css("display", "none");
    $('#comunicadosPanel').css("display", "none");
    $('#videosPanel').css("display", "block");
    //Se piden los contenidos de tipo video asociados al docente.
    $.getJSON( server+"/contenidos/Video/"+device.uuid, function( data ) {
        $('#videosTexto').empty();
        $("#ulVideo").empty();
        if(data.length === 0){
            var htmlInterior = "";
            htmlInterior += "<p>No hay videos para mostrar</p>";
            $("#videosTexto").append(htmlInterior);   

        } else {
            //En caso de que exista uno o más videos se cargan.
            videoData = data;
            $.each( data, function( key, val ) {
                var fechaString = convertirFecha(val.fecha);
                htmlInterior = "<li class='videolink ui-btn ui-shadow ui-corner-all' data-icon='bullets' key='"+key+"' file='"+val.nombreArchivo+"''>";
                    htmlInterior += "<a style='color:white;'>"+val.nombre+" - "+fechaString+" ►</a>";
                htmlInterior += "</li>";
                $("#ulVideo").append(htmlInterior);                             
            });   
            //Cargo los compartamientos de clases. 
            //Compartamiento asociado a hacer click en un elmento de la lista de videos.
            $( ".videolink" ).on( "click", function() {
                docenteApp.checkFileInMobile($( this ).attr("key"));
            });
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        docenteApp.irAPaginaError();
    });

},

//Carga las imágenes del docente en la sección de contenidos.
loadImagenesDocente: function(){
    $('#videosPanel').css("display", "none");
    $('#comunicadosPanel').css("display", "none");
    $('#imagenPanel').css("display", "block");
    $('.imagenGaleria').empty();
    $.getJSON( server+"/contenidos/Imagen/"+device.uuid, function( data ) {
        if(data.length === 0){
            var htmlInterior = "";
            htmlInterior += "<p>No hay imágenes para mostrar</p>";
            $('.imagenGaleria').empty();
            $('.imagenGaleria').append(htmlInterior);

        } else {
            //En caso de que exista una o más imágenes se cargan.
            $.each( data, function( key, val ) {
                var htmlInterior = ""; 
                htmlInterior += "<div class= 'responsive'>";
                    htmlInterior += "<div class='img'>";
                        htmlInterior += "<a class='imagenGaleriaLink'>";
                            htmlInterior += "<img src='"+server+"/"+val.nombreArchivo+"' >";
                        htmlInterior += "</a>"; 
                    htmlInterior += "<div class='desc' style='font-size: 2vw;'>"+val.descripcion+"</div>";
                    htmlInterior += "</div>";
                htmlInterior += "</div>"; 
                $('.imagenGaleria').append(htmlInterior);                     
            });
               $(".imagenGaleriaLink").click(function(){               
                $("#imagenPopupModal").css("display", "block");
                $("#imagenPopup").attr("src", $(this).children("img").attr("src"));
                $("#caption").html = "Probando";
                $(".close").click(function(){
                    $("#imagenPopupModal").css("display", "none");
                });
            }); 
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        docenteApp.irAPaginaError();
    });
    $(".imagenLink").click(function(){
        var htmlInterior = "<img class='imagenLink' style='margin:0px auto;display:block; text-align: center;' src='"+$(this).attr("src")+"' width='50%'>";
        $("#imagenBig").html(htmlInterior);
        $( "#imagenBig" ).popup( "open", {x : 0});
    }); 
},

//Carga los comunicados del docente en la sección de contenidos.
loadComunicadosDocente: function(){
    $('#videosPanel').css("display", "none");
    $('#imagenPanel').css("display", "none");    
    $('#comunicadosPanel').css("display", "block");
    $.getJSON( server+"/contenidos/Comunicado/"+device.uuid, function( data ) {
        if(data.length === 0){
            var htmlInterior = "";
            htmlInterior += "<p>No hay comunicados para mostrar</p>";
            $('#comunicadosPagina').empty();
            $('#comunicadosPagina').append(htmlInterior);
        } else {
            comunicados = data;
            //Mostrar los 3 comunicados mas recientes.
            docenteApp.mostrarMasComunicados(false); 
        }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        docenteApp.irAPaginaError();
    });
},

//Permite mostrar los comnicados anteriores.
//Por defecto la aplicación muestra los tres
//más recientes.
mostrarMasComunicados: function(mostrarTodos) {
    var htmlInterior = "";
    var cantidad;
    var mensajeBoton;
    var total;
    total = Object.keys(comunicados).length;
    if(mostrarTodos) {
        cantidad = total;
        mensajeBoton = "Mostrar menos";
    } else {
        cantidad = 3;
        mensajeBoton = "Mostrar anteriores";
    }
    for (var i = 0; i < cantidad; i++) {
        if(i < total) {
            htmlInterior += "<hr /><p><b>" + convertirFecha(comunicados[i].fecha) + " - " + comunicados[i].titulo + "</b></p>";
            htmlInterior += "<p><i>"+comunicados[i].cuerpo+"</i></p>";
        } else {
            i = cantidad; 
        }
    }
    // Si hay 3 comunicados o menos, no es necesario el boton para mostrar mas.
    if(total > 3) { 
        htmlInterior += '<hr /><a id="btMostrarMas" class="ui-btn ui-shadow ui-corner-all" data-role="button mini" onclick="docenteApp.mostrarMasComunicados('
            + !mostrarTodos + ')">' + mensajeBoton + '</a>';
    }
    $('#comunicadosPagina').empty();
    $('#comunicadosPagina').append(htmlInterior);  
},

//Chequea si un archivo existe en el celular o no.
checkFileInMobile: function(clave){
    var fileName = videoData[clave].nombreArchivo;
    window.resolveLocalFileSystemURL(store + fileName,                      
        function(fileEntry){ 
            checkAndLoadFile(store+fileName, clave);
        },
        function(error){
            downloadFileAndLoad(fileName, clave);
        });
},

//Direcciona a la página donde se despliega el mensaje de error.
irAPaginaError: function(){
    $(':mobile-pagecontainer').pagecontainer('change', '#paginaError', {
        transition: 'flip',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });
},

//Función que cierra la aplicación.
salir: function() {
    navigator.app.exitApp();
}

}//END API

})();
