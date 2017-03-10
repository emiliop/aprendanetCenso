/* SCORM */

var scorm = pipwerks.SCORM;
var visitado = [];


$(document).ready(function () {
	getJson();
});

function getJson(){
    $.ajax({
        url: './structure.json',
        async: false,
        dataType: 'json',
        success: function (data) {

            titulo = data.title;
            hijos = data.slides;
            menu = data.thems;
            submenu = data.subthems;
            contenidosMultimedia = data.contenidosMultimedia;
            init();
        }
    });
}

function init(){

	scorm.version = "1.2";
	var callSucceeded = scorm.init();

	if(callSucceeded){
        if(scorm.get("cmi.core.entry") == "ab-initio"){
            for (var i = 0; i < fn_total_hijos(menu.length); i++) {
                visitado[i] = [0];
            }
        }
        else {
            /*actual = parseInt(scorm.get("cmi.core.lesson_location").split('_')[0]);
            dp_actual = parseInt(scorm.get("cmi.core.lesson_location").split('_')[1]);*/

            var aux = scorm.get("cmi.suspend_data").split(",");
            var aux1 = [];
            for(var i=0; i < aux.length; i++){
                aux1 = [];
                for(var j=0; j < aux[i].length; j++){
                    aux1[j] = parseInt(aux[i].charAt(j));
                }
                visitado[i] = aux1;
            }
        }
    }
    else{
        for (var i = 0; i < fn_total_hijos(menu.length); i++) {
            visitado[i] = [0];
        }
    }
    //console.log(visitado);
	main();
}

function usuario(id){
	if (String(scorm.get("cmi.core.student_name")).length > 0 && String(scorm.get("cmi.core.student_name")).indexOf(',') != 1) {
        $(id).text(String(scorm.get("cmi.core.student_name")).split(', ')[1]);
    } else {
         $(id).text("");
    }
}

window.onunload = function (){
	end();
}

function end(){

	//scorm.set("cmi.core.lesson_location", actual + '_' + dp_actual);

	var aux_visitado_0 = "";
    var aux_visitado_1 = "";
    var aux_estado_1 = 0;
    var aux_estado_2 = 0;
    for (var i = 0; i < visitado.length; i++) {
        aux_visitado_1 = "";
        aux_estado_1 = 0;

        for (var j = 0; j < visitado[i].length; j++) {
            aux_visitado_1 += visitado[i][j];
            aux_estado_1 += visitado[i][j];
        }
        if(i == visitado.length - 1)
            aux_visitado_0 += aux_visitado_1;
        else
            aux_visitado_0 += aux_visitado_1 + ",";

        if(aux_estado_1 == visitado[i].length)
            aux_estado_2 += 1;
    }

	scorm.set("cmi.suspend_data", aux_visitado_0);

	if(aux_estado_2 == fn_total_hijos(menu.length))
		scorm.set("cmi.core.lesson_status", "completed");
	else
		scorm.set("cmi.core.lesson_status", "incomplete");

	scorm.save();

	var callSucceeded = scorm.quit();
}