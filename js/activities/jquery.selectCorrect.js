(function( $ ) {

    $.fn.selectCorrect = function( options ) {
 		
 		return this.each(function() {

	 		var settings = $.extend({
	            correctOptions: '',
	            possibleAnswers:'',
	            selectedAnswers:''
	        }, options);
	 		 
	 		settings.possibleAnswers = $(this).find('.icon input').map(function(_, el) {
	    		return $(el).val();
			}).get();

	 		$(this).find('.cta').click(this,function(e) {

	 			var parent = e.data;

	  			settings.selectedAnswers = $(parent).find('.icon input:checked').map(function(_, el) {
	    			return $(el).val();
				}).get();

	  			settings.correctOptions.forEach(highlightCorrect, parent);

	  			settings.possibleAnswers.forEach(score, settings);
	 
			});

		});
 		
    };

    function highlightCorrect(answer) {
    	$(this).find('#res-'+answer).addClass('correct');
    };

    function score( possibleAnswer ) {
    	var iconContainer = $('#res-'+possibleAnswer).parent().siblings('.icon');
    	iconContainer.addClass('graded');

    	if($.inArray(possibleAnswer, this.correctOptions) >= 0 && $.inArray(possibleAnswer, this.selectedAnswers) >= 0){    		
    		iconContainer.children('span.icon-').addClass('icon-correct-01');
    	}else{
    		iconContainer.children('span.icon-').addClass('icon-incorrect-01');
    	}
    };

 
}( jQuery ));