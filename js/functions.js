/* Variables asignadas en el scorm.js*/
var titulo = "";
var menu = [];
var submenu = [];
var hijos = [];
var contenidosMultimedia = [];

/* Cantidad de diapositivas*/
var total_hijos = 0;

/* Auxiliar para callaback animate de la diapositiva */
var valida_carga = true;

/* preload */
var preload;

/*Auxilizares navegacion drag*/
var ancho_menu = 0;
var menuAcumulado = [];
var intPi = [];
var intPf = [];
var inch = 0;
var aux_dragdrop = false;

var contrast = false;
var speed = 1000;

var activatePrecarga = true;
function main() {

    $('#contenido').css('height', ($(window).height() - $('.header-superior').height() - $('.cnt-progressBar').height()) + 'px');

    if(activatePrecarga){
        if (preload != null) {preload.close();}

        preload = new createjs.LoadQueue();

        while(imagesArray.length > 0)
        {
            var itemPreload = imagesArray.shift();
            preload.loadFile(itemPreload);
        }

        preload.on('progress',function(){
            $("#precarga h2").text(Math.floor((preload.progress)*100) + "%");
        });

        preload.on('complete',function(){
            $('#precarga').fadeOut();
            fn_detectarErrores();
            fn_generarmenu();
            fn_cargarrecursos();
        });
    }else{
        $('#precarga').fadeOut();
        fn_detectarErrores();
        fn_generarmenu();
        fn_cargarrecursos();
    }

    /* Eventos de teclado */
    $(document).keydown(function(e){
        if(valida_carga){
            switch (e.keyCode) {
                case 37:
                    e.preventDefault();
                    if (getTema() <= 0){
                        return
                    }
                    else{
                        fn_changeTheme(getTema() - 1);
                    }
                    break;
                case 39:
                    e.preventDefault();
                    if (getTema() == menu.length - 1){
                        return
                    }
                    else{
                        fn_changeTheme(getTema() + 1);
                    }
                    break;
                case 38:
                    e.preventDefault();
                    if (getsubTema() <= 0){
                        return
                    }
                    else{
                        fn_scrollto(getTema() - 1,getsubTema());
                    }
                    break;
                case 40:
                    e.preventDefault();
                    if (getsubTema() == $("#contentSlide" + getTema() + " .sections").length - 1){
                        console.log('nobaja');
                        return
                    }
                    else{
                        fn_scrollto(getTema() - 1,getsubTema() + 2);
                    }
                    break;
            }
        }
    });


    if($(window).width() < 992){
        $("#menu").hide(); speed = 500;
        /*Eventos mobile*/
        $( ".container" ).on( "swiperight", function(e){
            e.preventDefault();
            if (getTema() <= 0){
                return
            }
            else{
                fn_changeTheme(getTema() - 1);
            }
        });

        $( ".container" ).on( "swipeleft", function(e){
            e.preventDefault();
            if (getTema() == menu.length - 1){
                return
            }
            else{
                fn_changeTheme(getTema() + 1);
            }
        });
    }

    $("#btn-Menu").on('click',function(){
        if($(window).width() < 992)
            $("#menu").slideToggle();
    });

    $("#menu").on('click',function(){
        if($(window).width() < 992)
            setTimeout(function(){$("#menu").slideUp(); },350);
    });

    //Evento audio hover
    $('body').on('mouseenter','.btn-sound',function(){playSound('hover');});
    //Evento cambia tabs
    $('body').on('click','.btn-tab',change_tab);


    //btn settigns
    $('#btn-setting').on('click',fn_showSettings);
    $('#btn-fontsize').on('click',fn_incrementFont);
    $('#btn-contrast').on('click',fn_contrast);


    $(window).resize(function() {
        $('#contenido').css('height', ($(window).height() - $('.header-superior').height() - $('.cnt-progressBar').height()) + 'px');
        if($(window).width() >= 992)
        {
            $("#menu").show();
            if($("#contentSlide>.sections").length > 1)
                $("#verticalMenu").show();
        }
        else
            $("#menu,#verticalMenu").hide();
    });

    /* Nagegacion drag */

    total_hijos = fn_total_hijos(menu.length);

    ancho_menu = $('.cnt-progressBar').width() / total_hijos;

    var acum = 0;
    for (var i = 0; i < hijos.length; i++) {
        acum += hijos[i];
        menuAcumulado[i] = acum;
    }

    for(var j=0;j<total_hijos;j++)
    {
        intPi[j]=j*ancho_menu;
        intPf[j]=(j+1)*ancho_menu;
    }

    /*Event button dragabble*/
    $('.drag-progressBar').draggable({axis: 'x', cursor: 'pointer', containment : '.cnt-progressBar',
        drag: function(evt,e)
        {
            aux_dragdrop = false;

            for(var i=0;i<total_hijos;i++)
            {
                if((e.position.left >= intPi[i])&&(e.position.left < intPf[i]))
                    inch = i;
            }


            var dato = 0;
            for (var i = 0; i < menuAcumulado.length; i++) {
                if(inch <= menuAcumulado[i]-1){
                    dato = i;
                    break;
                }
            }

            switch(dato + '.' + (inch - (menuAcumulado[dato] - hijos[dato]))){
                case '0.0':
                    $('.drag-progressBar').attr('data-num', 'P');
                    break;
                case '1.0':
                    $('.drag-progressBar').attr('data-num', 'M');
                    break;
                default:
                    $('.drag-progressBar').attr('data-num', (dato-1) + '.' + (inch - (menuAcumulado[dato] - hijos[dato])));
                    break;
            }

            $('#progressBar div').css({width: e.position.left + 15 + 'px'});
        },
        stop: function(evt, e)
        {
            var dato = 0;
            for (var i = 0; i < menuAcumulado.length; i++) {
                if(inch <= menuAcumulado[i]-1){
                    dato = i;
                    break;
                }
            }

            fn_changeTheme(dato);
            fn_scrollto(dato - 1,(inch+1) - (menuAcumulado[dato] - hijos[dato]));
        }
    });

}

/*
 * Esta función detecta la versión del explorador para los más usuados si la versión
 * del mismo es menor a la indicada devuelve un alert indicado que el explorador usado
 * es una versión antigua y puede generar problemas con el simulador.
 *
 * @return {alert} description alert
 */

function fn_detectarErrores() {


    if ($.browser.mozilla === true) {
        if ($.browser.versionNumber < 30)
            alert("Debes actualizar tu explorador Firefox a una versión más reciente.\nPara más información, consulta la sección de Especificaciones técnicas");

    } else if ($.browser.msie === true) {
        if ($.browser.versionNumber < 11)
            alert("Debes actualizar tu Internet Explorer a una versión más reciente.\nPara más información, consulta la sección de Especificaciones técnicas");

    } else if ($.browser.webkit === true) {
        if ($.browser.versionNumber < 7)
            alert("Debes actualizar tu explorador Safari o Chorme a una versión más reciente.\nPara más información, consulta la sección de Especificaciones técnicas");

    } else if ($.browser.opera === true) {
        if ($.browser.versionNumber < 11)
            alert("Debes actualizar tu explorador Opera a una versión más reciente.\nPara más información, consulta la sección de Especificaciones técnicas");

    } else {
        alert("Es posible que con tu navegador este sitio presente algunos errores.\nPara más información, consulta la sección de Especificaciones técnicas");
    }
}

function fn_cargarrecursos()
{
    var sections = '';

    for(var i in hijos)
    {
        sections += '<div id="contentSlide'+i+'" class="contentSlide" onscroll="javascript:navegacionScrollVertical(this.id)"></div>';
    }
    $('#contenido').html(sections);

    $('body, #contenido, .header-superior,.container').css('background-color', $('#contentSlide0').css('background-color'));
    $('.btn_close, .menu_item_title').css('color', $('#contentSlide0').css('background-color'));

    for(var i in hijos)
    {
        for(var j = 1; j<=hijos[i]; j++) {
            $('#contentSlide'+i).append('<div id="sections'+i+'-'+j+'" class="sections" data-ref="'+j+'"></div>');

            $.ajax({
                method: 'GET',
                url: 'contents/t' + i + "/t" + i + "_" + j + '.html?=' + (new Date()).getTime(),
                async: false,
                dataType: 'text/html',
                success: function (data) {
                    //console.log(data);
                },
                error: function (err) {
                    //console.log(err);
                },
                complete: function (data) {
                    $('#sections'+i+'-'+j).html(data.responseText);
                }
            });
        }
    }

    $('#tema').html('<p><b>'+titulo +'</b> / ' + menu[0]+'<p>');

    $('body #contenido').scrollLeft(0);

    // Generar Tablas de Contenido
    $('.container-tab').each(function(item,value){
        if(item == 0)
            content_tbl(value);
        else
            subcontent_tbl( value, $(value).parents('.contentSlide').index() );
    });
}

function fn_generarmenu() {
    $('#menu').append('<div class="menu_item_title">Contenidos</div>');
    $.each(menu, function(k, v) {
        switch(k){
            case 0:
                $("#menu").append('<li class="fila-flex centrar-horizontal cnpv-cvt cnpv-item cnpv-siitem animaall btn-sound" onclick="javascript:fn_changeTheme('+k+');javascript:fn_drag();" style="display: none;"><div class="menu_item_title">'+ menu[k] +'</div><span>'+k+'</span></li>');
                break;
            case 1:
                $("#menu").append('<li class="fila-flex centrar-horizontal cnpv-cvt cnpv-item cnpv-siitem animaall btn-sound" onclick="javascript:fn_changeTheme('+k+');javascript:fn_drag();"><div class="menu_item_title">'+ menu[k] +'</div><span class="icon-table2"></span></li>');
                break;
            default:
                $("#menu").append('<li class="fila-flex centrar-horizontal cnpv-cvt cnpv-item cnpv-siitem animaall btn-sound" onclick="javascript:fn_changeTheme('+k+');javascript:fn_drag();"><div class="menu_item_title">'+ menu[k] +'</div><span>'+(k-1)+'</span></li>');
                break;
        }
    });
}

function fn_changeTheme(index)
{
    $('#contentSlide'+index).scrollTop(0);
    valida_carga = false;
    aux_dragdrop = true;
    var currentElement = $('#contentSlide'+index).width();
    var bgcolor = $('#contentSlide'+index).css('background-color');

    $('#tema').html('<p><b>'+titulo +'</b> / ' + menu[index]+'<p>');

    $('body #contenido').animate({scrollLeft: [currentElement * index]},speed, function(){
        valida_carga = true;
        fn_drag();
    });
    $('body, #contenido, .header-superior,.container').css('background-color', bgcolor);
    $('.btn_close, .menu_item_title').css('color',bgcolor);

    $('.cnpv-siitem').removeClass('active_menu');
    $('.cnpv-siitem').eq(index).addClass('active_menu');

    if($(window).width() >= 992)
        fn_vertical_menu(index);

    fn_miga(index);
    $('#miga').hide();
}

function fn_vertical_menu(index)
{
    $('#verticalMenu').empty();
    var listMenu = $("#contentSlide" + index).children(".sections").size();
    for(var i = 1; i<=listMenu; i++)
    {
        if($('#item-self-'+i).hasClass('visto'))
            $('#verticalMenu').append('<li class="animated  fadeInDown delay'+i+' bulletView btn-sound" onclick="javascript:fn_scrollto('+(index-1)+','+i+');javascript:fn_drag();" data-tooltip="'+submenu[index][i-1]+'" data-num="'+(index-1)+'.'+(i-1)+'"></li>');
        else
            $('#verticalMenu').append('<li class="animated fadeInDown delay'+i+' btn-sound" onclick="javascript:fn_scrollto('+(index-1)+','+i+');javascript:fn_drag();" data-tooltip="'+submenu[index][i-1]+'" data-num="'+(index-1)+'.'+(i-1)+'"></li>');
    }

    if(listMenu === 1)
        $('#verticalMenu').hide();
    else
        $('#verticalMenu').fadeIn();

    $('#verticalMenu li').eq(0).addClass('active_menuV');
    $('#verticalMenu li').eq(0).addClass('bulletView');
}

function fn_scrollto(index,par)
{
    valida_carga = false;
    var alturas = 0;
    ocultaMiga(index,par-1);

    $('#contentSlide'+(index+1) + ' .sections').each(function (i,e) {

        if($(this).attr("id") == 'sections'+(index+1)+'-'+par){
            $('#contentSlide'+(index+1)).animate({scrollTop: alturas},1000,function(){
                valida_carga = true;
                aux_dragdrop = true;

                switch((index+1) + '.' + (par - 1)){
                    case '0.0':
                        $('.drag-progressBar').attr('data-num', 'P');
                        break;
                    case '1.0':
                        $('.drag-progressBar').attr('data-num', 'M');
                        break;
                    default:
                        $('.drag-progressBar').attr('data-num', index + '.' + (par - 1));
                        break;
                }

                return;
            });
        }

        alturas += parseInt($(this).height());
    });

}

function fn_miga(index){
    $('#miga').html('<div class="centrar-vertical"><div class="numero">'+(index-1)+'</div><div class="texto"><h1>'+titulo+'</h1><hr/><h2>'+menu[index]+'</h2></div></div>');
    $('#miga br').remove();
}


function ocultaMiga(theme,subtheme){
    if($('#contentSlide'+(theme+1)+' .sections').eq(subtheme).children(0).data('miga') && $(window).width() > 992 )
        $('#miga').fadeIn();
    else
        $('#miga').fadeOut();
}

function getTema(){

    var tema = 0;
    $('.cnpv-siitem').each(function(i,e){
        if($(this).hasClass("active_menu"))
            tema = i;
    });

    return tema;
}

function getsubTema(){

    var subtema = 0;
    $('#verticalMenu li').each(function(i,e){
        if($(this).hasClass("active_menuV"))
            subtema = i;
    });
    return subtema;
}

function fn_drag(){
    switch(getTema() + '.' + getsubTema()){
        case '0.0':
            $('.drag-progressBar').attr('data-num', 'P');
            break;
        case '1.0':
            $('.drag-progressBar').attr('data-num', 'M');
            break;
        default:
            $('.drag-progressBar').attr('data-num', (getTema()-1) + '.' + getsubTema());
            break;
    }
    $('.drag-progressBar').animate({left:intPi[(fn_total_hijos(getTema())+ getsubTema())]+'px'},{ queue: false });
    $('#progressBar div').animate({width: intPi[(fn_total_hijos(getTema())+ getsubTema())] + 15 + 'px'},{ queue: false });
}

function fn_total_hijos(ult_elem) {
    var total_ret = 0;
    $.each(hijos, function(k, v) {
        if (k < ult_elem)
            total_ret += v;

    });

    return total_ret;
}

function navegacionScrollVertical(self){
    if($(".cnpv-siitem").hasClass("active_menu") && aux_dragdrop){
        var scrollPos = $(document).scrollTop();
        $('#' + self + ' .sections').each(function (i,e) {
            var currLink = $(e);
            if (currLink.position().top <= scrollPos && currLink.position().top + currLink.height() > scrollPos) {
                $('.active_menuV').removeClass('active_menuV');
                $('#verticalMenu li').eq(i).addClass('active_menuV');
                $('.drag-progressBar').attr('data-num', (getTema()-1) + '.' + i);
                $('.drag-progressBar').animate({left: intPi[fn_total_hijos(getTema()) + i]+'px'},{ queue: false });
                $('#progressBar div').animate({width: intPi[fn_total_hijos(getTema()) + i] + 15 + 'px'},{ queue: false });
                ocultaMiga(getTema()-1,i);

            }
        });
    }
}

// Tabla de contenido
function content_tbl(element){
    var table = '<ul class="menu-tab">';
    //console.log(table);
    for (i=2; i < menu.length; i++) {
        table = table.concat('<li id="item-self-'+i+'" class="item-self btn-sound" data-actual="'+i+'" onclick="javascript:fn_changeTheme('+i+');javascript:fn_drag();">');
        table = table.concat('<div class="toptab"><span class="letter">'+(i-1)+'</span>'+getContentByThemes(i)+'</div>');
        table = table.concat('<div class="centertab">');
        table = table.concat('<span class="titletab">'+menu[i]+'</span><span class="lineti"></span>');
        table = table.concat('</div>');
        table = table.concat('</li>');
    };
    table = table.concat('</ul>');
    $(element).html(table);
    $('#tituloModulo').html(titulo);
}

function subcontent_tbl(element,menu_item){
    items =  submenu[menu_item];
    var table = '<ul class="menu-tab">';
    for (i=1; i < items.length; i++ ) {
        var scroll = Number(i)+1;
        table = table.concat('<li id="item-self-'+scroll+'" data-ref="'+(i-1)+'" class="item-self btn-view btn-sound" onclick="javascript:fn_scrollto('+(menu_item - 1)+','+scroll+');javascript:fn_drag();">');
        table = table.concat('<div class="toptab"><span class="letter">'+(menu_item-1)+'.'+i+'</span>'+getContentBySubThemes(menu_item,i)+'</div>');
        table = table.concat('<div class="centertab">');
        table = table.concat('<span class="titletab">'+items[i]+'</span><span class="lineti"></span>');
        table = table.concat('</div>');
        table = table.concat('</li>');
    };
    table = table.concat('</ul>');
    $(element).siblings('.title').empty().append(menu[menu_item]);
    $(element).html(table);
}

// Variables para esas funciones
var lista = ["Imagen", "Video","Actividad","Bibliografia", "PDF","Esdadisticas","Infografia","Glosario", "Audio", "Hipervínculo"];
var iconos = ["icon-image", "icon-film", "icon-pencil", "icon-book", "icon-file-text2", "icon-stats-bars", "icon-tree", "icon-spell-check", "icon-volume-medium", "icon-link"]

// Leer de subtemas
function getContentBySubThemes (theme,subtheme){
    var elemento = '<div class="elementos">',
        contenidos = contenidosMultimedia[theme][subtheme]

    if (typeof contenidos !== 'undefined') {
        for (cont in lista){
            if (contenidos.indexOf(lista[cont]) > -1){
                elemento = elemento.concat('<span class="iconomultimedia '+iconos[cont] +'" title="'+lista[cont]+'"></span>');
            }
        }
    }

    elemento = elemento.concat('</div>');
    return elemento;
}
// leer para temas
function getContentByThemes(theme){
    var elemento = '<div class="elementos">',
        contenidos = contenidosMultimedia[theme],
        themeContent = [];
    if (typeof contenidos !== 'undefined') {
        for (cont in contenidos){
            themeContent = themeContent.concat(contenidos[cont]);
        }
        for (cont in lista){
            if (themeContent.indexOf(lista[cont]) !== -1){
                elemento = elemento.concat('<span class="iconomultimedia '+iconos[cont] +'" title="'+lista[cont]+'"></span>');
            }
        }
    }

    elemento = elemento.concat('</div>');
    return elemento;
}

function loadSound () {
    createjs.Sound.registerSound("audio/hover.mp3", 'hover');
}

function playSound(audio) {
    createjs.Sound.play(audio);
}

/*ACCIONES*/

/**BOTONERA**/
function btn() {
    $("#modal" ).hide();
    var n = $("#botones li").size();
    for (var i=0; i<n; i++) {
        var h = i+1;
        var btnClk = "#b"+h;

        $(btnClk).click(function(){
            selec = $(this).attr("id");
            url = $(this).attr("name");
            cargaCont(selec,url);

            $(this).addClass("vistoPop");
        });
    }
}

/**MODAL**/
function cargaCont(selec,url) {
    var pagina = selec.slice(-1);
    var vinculo = url;
    var itm = vinculo+pagina+".html"
    anima_contenido = "";
    $("#modal").fadeTo("fast",0, function() {
        $("#contModal").load(itm);
        $("#modal").fadeTo("fast",1);
    });
};

function cargaContLnk(url,selec) {
    var itm = url;
    var sel = "#"+selec;
    anima_contenido = "";
    $("#modal").fadeTo("fast",0, function() {
        $("#contModal").load(itm);
        $("#modal").fadeTo("fast",1);
    });
    $(sel).addClass("vistoPop");
};

function cerrar() {
    $("#modal").fadeTo("fast",0, function() {
        $("#modal").hide();
    });
}

function cambiaTxt(selec) {
    var itm = eval(selec);
    $("#contenidosIn").fadeTo("fast",0, function() {
        $("#contenidosIn").html(itm);
        $("#contenidosIn").fadeTo("fast",1);
    });
};

/*--RETRO--*/

function ocultaRetro (num) {
    $("#mal").hide();
    $("#bien").hide();
    var cantidad = num;

    for (var i=1; i<cantidad; i++) {
        var ventana = "#info"+i;
        $(ventana).hide();
    }
}

function errado() {
    $("#mal").fadeTo("fast",1);
}

function acierta() {
    $("#bien").fadeTo("fast",1);
}

function pop(elemento) {
    var itm = "#info"+elemento;
    var selec = "#"+elemento;
    $(itm).fadeTo("fast",1);
    $(selec).addClass("vistoPop");
}

function cierraVentana (selec) {
    var obj = "#"+selec;
    $(obj).fadeTo("fast",0, function() {
        $(obj).hide();
    });
}

/*--ACORDEON---*/
function acord() {
    $('.acordeon').magicAccordion({
        headingTag  : 'h2',
        bodyClass   : 'body',
        headClass   : 'head',
        activeClass : 'active',
        speed       : 200,
        easing      : 'swing',
        openOnLoad  : 0,
        hashTrail : false
    })
        .on( 'opened.magic', function(e){
            console.log(e.head);
        })
        .on( 'closed.magic', function(e){
            console.log(e.body);
        });

    var app = $('.acordeon').data( 'magic-accordion' );
}

/*--TABS--*/

function change_tab()
{
    var rel = $(this).data('link');
    console.log(rel);
    $(this).siblings('a').removeClass('active-a');
    $(this).addClass('active-a');
    $(this).parents('.btns').siblings('.tabs').find('.tab').hide();
    $(this).parents('.btns').siblings('.tabs').find('[data-tab="'+rel+'"]').fadeIn();
}

/*--SELECTOR--*/
function selector () {
    $(".transparente span").css({"color": "rgba(255,255,255,0)"});

    $("li").click(function(){
        var seleccionado = $(this).attr("id");
        var sel = eval('"#'+seleccionado+' > span"')
        $(sel).css({"color": "#fff"});
    });
}

/*--SELECTOR2--*/
function selector2 () {
    $(".transparente td").css({"color": "rgba(255,255,255,0)"});

    $("tr").click(function(){
        var seleccionado = $(this).attr("id");
        var sel = eval('"#'+seleccionado+' > td"')
        $(sel).css({"color": "#fff"});
    });
}

/*--- funcionalides menu de configuración ---*/

function fn_showSettings()
{

    if($(this).data('hide'))
    {
        $('#settings').animate({width:'80'},350);
        $(this).data('hide',false);
    }
    else
    {
        $('#settings').animate({width:'0'},350);
        $(this).data('hide',true);
    }
}
var increment = 0;
function fn_incrementFont()
{
    increment++;
    switch(increment) {
        case 1:
            $(this).addClass('active');
            $('html').addClass('incrementFont');
            break;
        case 2:
            $(this).removeClass('active').addClass('activeMax');
            $('html').removeClass('incrementFont').addClass('incrementFontMax');
            break;
        case 3:
            $(this).removeClass('activeMax');
            $('html').removeClass('incrementFontMax');
            increment = 0;
            break;
    }

}

function fn_contrast ()
{
    if(!contrast) contrast = true;
    else contrast = false;

    if(contrast)
    {
        $('.header-superior,.contentSlide').addClass('bg-contrast');
        $('.btn_close, .menu_item_title').addClass('color-contrast');
        $(this).addClass('active');

    }
    else {
        $('.header-superior,.contentSlide').removeClass('bg-contrast');
        $('.btn_close, .menu_item_title').removeClass('color-contrast');
        $(this).removeClass('active');
    }

}

