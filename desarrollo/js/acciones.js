// JavaScript Document
var cant = 0;

var data1 = [];
var data2 = [];
var data3a = [];
var data3b = [];

var auxiliar_inicio = 0;
var auxiliar_correr = 0;
var auxiliar_final = 0;
var auxiliar_contadora = 0;
var auxiliar_contadorb = 0;

var html = "";
var auxiliar_contador=0;

function esconde(numero) {
    $("#inf").fadeTo("fast",0);
    for (i = 1; i <= numero; i++) { 
       $("#sub"+i).hide(); 
    }
}

function muestra(selec) {
    $("#inf").fadeTo("fast",0);
    $("#spc").hide();
    for (i = 1; i <= cant; i++) {
       $("#sub"+i).hide();
       $("#inf").removeClass("color"+(i-1));
       //-------
       var itm = "#sub"+selec;
       $(itm).fadeTo("slow",1);

       $("#"+i).removeClass("elegido");
       $("#"+i).parent().removeClass("color" + i);
       
       $("#inf").addClass("color"+selec);
    }
    $("#infor").addClass("ele");
    $("#inf").addClass("ele");

    $("#"+selec).addClass("elegido");
    $("#"+selec).parent().removeClass("colorBase");
    $("#"+selec).parent().addClass("color" + selec);
}

function escribe(esto) {
    for (i = 0; i < 10; i++) {
        var ele = "#s"+i+"_";
        for (n = 0; n < 10; n++) {
            $(ele+n).removeClass("activa");
            //$("#"+esto).removeClass("color"+n);
        }
    }
    $("#"+esto).addClass("activa");

    var split = $("#"+esto).attr("data-ref").split('-');
    
    html = "";
    auxiliar_contador=0;

    for(var i = 0; i < data3a[0][split[0]][split[1]].length; i++){
      if(data3a[0][split[0]][split[1]][i] != ""){
        if(auxiliar_contador==0){
          html += "<div id='"+split[0]+"-"+split[1]+"-"+i+"' class='tab-links activa' onclick='informa(this.id)' data-ref='0-"+split[0]+"-"+split[1]+"-"+i+"'>" + data3a[0][split[0]][split[1]][i] + "</div>";
          $("#inf #informacion").html(data3b[0][split[0]][split[1]][i]);
        }          
        else {
          html += "<div id='"+split[0]+"-"+split[1]+"-"+i+"' class='tab-links' onclick='informa(this.id)' data-ref='0-"+split[0]+"-"+split[1]+"-"+i+"'>" + data3a[0][split[0]][split[1]][i] + "</div>";
        }
        auxiliar_contador += 1;
      }
    }

    $("#inf .tabs").html(html);

    $("#inf").fadeTo("fast",1);
}

function informa(esto){
  $("#inf .tabs .activa").removeClass("activa");
  $("#"+esto).addClass("activa");

  var split = $("#"+esto).attr("data-ref").split('-');
  $("#inf #informacion").html(data3b[split[0]][split[1]][split[2]][split[3]]);
}

jQuery(document).ready(function() {

  $.ajax({
      type: "GET",
      url: "info/data.csv",
      dataType: "text",
      success: function(data) { 
        var lines = data.split(/\r\n|\n/);
        
        //Set up the data arrays
         
        for (var i=0; i<lines.length; i++) {
            var values = lines[i].split(';'); // Split up the comma seperated values
            if(values[0] != "" && values[0] != undefined ){
              data1.push(values[0]);
              auxiliar_contador += 1;
              html += "<div class='item color"+auxiliar_contador+"' id='"+auxiliar_contador+"' onclick='muestra(this.id)'><div class='itemTxt'> "+values[0]+" </div></div>";
            }
        }

        $("#nivel1").html(html);
        html = "";
        auxiliar_contador = 0;

        for (var j = 0; j < data1.length; j++) {

          data2[j] = new Array();

          for (var i=0; i<lines.length; i++) {
            var values = lines[i].split(';'); // Split up the comma seperated values
            if(values[j+1] != "" && values[j+1] != undefined){
              data2[j][i] = values[j+1];
              auxiliar_contador += 1;
              html += "<div class='item color"+(j+1)+"' id='s"+(j+1)+"_"+auxiliar_contador+"' onclick='escribe(this.id)' data-ref='"+j+"-"+i+"'><div class='itemTxt'> "+(values[j+1])+" </div></div>";
            }
          }
          auxiliar_contador = 0;
          $("#sub" + (j+1)).html(html);
          html = "";
        }
        cant = data1.length+1;
        esconde(data1.length);

        auxiliar_inicio = (data1.length + 1);      

        auxiliar_contador = 0;
        html = "";

        data3a[0] = [];
        data3b[0] = [];

        for (var m = 0; m < data2.length; m++) {

          data3a[0][m] = [data2[m].length];
          data3b[0][m] = new Array();

          auxiliar_correr = data2[m].length * 2;

          for (var k = 0; k < auxiliar_correr; k++) {


            if (k % 2) {
              
              data3b[0][m][auxiliar_contadorb] = [lines.length];
           
              for (var l=0; l<lines.length; l++) {
                var values = lines[l].split(';'); // Split up the comma seperated values

                if(values[parseInt(auxiliar_inicio+k)] != "" && values[parseInt(auxiliar_inicio+k)] != undefined)
                  data3b[0][m][auxiliar_contadorb][l] = values[parseInt(auxiliar_inicio+k)];
                else
                  data3b[0][m][auxiliar_contadorb][l] = "";

              }

              auxiliar_contadorb += 1; 

            }
            else {

              data3a[0][m][auxiliar_contadora] = [lines.length];
           
              for (var l=0; l<lines.length; l++) {
                var values = lines[l].split(';'); // Split up the comma seperated values

                if(values[parseInt(auxiliar_inicio+k)] != "" && values[parseInt(auxiliar_inicio+k)] != undefined){
                  data3a[0][m][auxiliar_contadora][l] = values[parseInt(auxiliar_inicio+k)];
                  //html = "<div class='tab-links' id='s4_$valTab' onclick='informa(this.id)'> $C6 </div>"
                }
                else
                  data3a[0][m][auxiliar_contadora][l] = "";

              }

              auxiliar_contadora += 1;

            }

          }

          auxiliar_contadora = 0;
          auxiliar_contadorb = 0;
          auxiliar_inicio += auxiliar_correr;

        }
        //console.log(data1);
        //console.log(data2);
        //console.log(data3a);
        //console.log(data3b);
      }
  });

  jQuery('.tabs .tab-links a').on('click', function(e)  {
      var currentAttrValue = jQuery(this).attr('href');

      // Show/Hide Tabs
      jQuery('.tabs ' + currentAttrValue).slideDown(400).siblings().slideUp(400);

      // Change/remove current tab to active
      jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

      e.preventDefault();
  });
});