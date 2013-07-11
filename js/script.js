SC.initialize({
  client_id: '6ffd5714efc7c32a70e03dabd8137cbc'
});

$(document).ready(function() {

	// set initial global variables   
    var $nebulaButton = $('.current-nebula a');
    var amountOfTracks = 50;
    // Set error fixing attempts counter
	var a = 0;	

	/*
	** Clear the main tracks container
	*/ 

	function clearResults() {
		// First, let's clear the area if there were previous results from other nebulas:
		$('#results').html('');	
	}

	/*
	** Set currentNebula allows the initial set up of the #results. It populates the tracks.
	*/ 

	function generateRandomNebula() {
		// generate random number from 1-6
		var random6 = Math.floor((Math.random()*6)+1);

		// set current nebula based on random number from 1-6
		$('ul.nebulas li').each(function(){
			if ($(this).attr('data-number') == (random6).toString()) {
				$(this).addClass('current-nebula');
			};
		});		
	}

	/*
	** Set currentNebula allows the initial set up of the #results. It populates the tracks.
	*/ 

	function setCurrentNebula () {	
		// clear error fixing attempts counter
		a = 0;
		clearResults();
		i = 0;
		$('.playing a.sc-pause').click();
		//var i = 4;		

		// Initialize BPM and nebula variables			
		var $currentNebula = $('.current-nebula a');

		var nebula = $currentNebula.text();
		var nebulaForScroll = $currentNebula.text();
		var minBpm = $currentNebula.attr('data-min-bpm');
		var maxBpm = $currentNebula.attr('data-max-bpm');

		// define search filters for SC api
		var filterTracks = {   
			bpm: { from: minBpm, to: maxBpm }, 
			//filter: 'downloadable', 
			//tags: tagList, 
			genres: 'psytrance',
			//q: 'dark',
			//types: 'original',
			//order: 'created_at',
			limit: amountOfTracks,
			offset: 0	
			};

		// pass nebula var to infinite Scroll and addMoreTracks
		infiniteScroll(nebulaForScroll, i, minBpm, maxBpm);
		
		//addMoreTracks(nebulaForScroll, i, minBpm, maxBpm);

		// remove body classes
		$('body').removeClass();
		// add body class 
		$('body').addClass(nebula).addClass('init');

		// populate new set of tracks
		populate(filterTracks, nebula, i);
	}

	function applyScrubberNebula () {
		// smother over scrubber background image
		$('.sc-scrubber .sc-time-span img').css('background', 'url(' + this.nebula + ')' );			
	}

	/*
	** Populate the tracks and embed widgets at will.
	*/

	function populate ( filterTracks, nebula, i) {
		$('body').attr('data-finished-loading', '');
		$('div#loadmoreajaxloader').show();
						
    	// Get the tracks and embed the widget for every li element
	    SC.get('/tracks', filterTracks, function(tracks, error) {
		    $(tracks).each(function(index, track) {
		    	//console.log(track.track_type);

		    	var $oops = $('.oops');

		    	if (error) { 
		    		// call populate if less than 11 tries have ben attempted for current nebula
		    		if ((a>=0) && (a<=10)) {
		    			populate (filterTracks, nebula);
		    			console.log('tried population: ' + a );
		    			// increment error fixing attempts counter
		    			a++
		    		} else { // else display error message
		    			$('div#loadmoreajaxloader').hide();
		    			console.log(nebula);
		    			if ($oops.length < 1) {

		    				if ($('#results li').length > 0 ) {
		    					$('body.' + nebula + ' #results').append('<div class="oops">Oops. There is a problem with teleportation. You can either try to scroll down again or select a new nebula</div>'); 
		    				} else {
		    					$('#results').append('<div class="oops">Oops. There is a problem with teleportation. Please select another nebula</div>'); 
		    				}		    				
		    			};    					    			 
		    		}
		    	}

		    	var trackTitleText = $('.track-title').text();
		    	// console.log(trackTitleText);

			    if (track.embeddable_by == 'all') {
			    	// reset count of error tries to zero
			    	a = 0;
			    	// Remove oops messages if there are any.
			    	$oops.remove();

			    	$('div#loadmoreajaxloader').hide();

		    	    $('body.' + nebula + ' #results').append($('<li class="track-' + index + '"></li>').html(

		    	    	'<a class="track-title" href="#" >' + track.title + '</a>' 
		    	  //   	+
		    			// ' Type: ' + track.track_type + ' - ' 
		    			// + 
		    			// ' Genre: ' + track.genre + ' - '
		    			+ 
		    			' <a class="track-user-username" href="' + track.user.permalink_url + '" target="_blank">' + track.user.username + '</a>'
		    			// +
		    			// '<br>'
		    			
		    			// ' Tags: ' + track.tag_list + ' - '
		    			// +
		    			// ' BPM: ' + track.bpm + ' - ' + 'nebula: ' + nebula +
		    			+
		    			'<a href="' + track.permalink_url + '" target="_blank"><img class="sc-logo-dark" src="http://developers.soundcloud.com/assets/logo_big_black-75c05c178d54c50c8ff0afbb282d2c21.png" /></a>'
		    			+
		    			'<span class="permalink">' + track.permalink_url +'</span>'
		    	    // +
		    	    // '<a href="http://soundcloud.com/matas/hobnotropic" class="sc-player">My new dub track</a>'
		    	    ));									    		       			
			    };			  
		    });
			
			$('body').attr('data-finished-loading', 'yes');

			// if adequate amount of tracks have loaded and this is initial population, then randomize existing li items
			if ( $('body').hasClass('init') && ($('ul#results li').length > amountOfTracks - 5) ) {				
				$('ul#results').randomize();				      
			};
			// further process the list
			removeDuplicates();

			if ( $('body').hasClass('init') ) {
				playFirstTrack(nebula);
			}
						
			insertPlayerOnTitleClick();
		});
	} // end populate ()


	/*
	** Randomize function to randomize list elements
	*/

	$.fn.randomize = function(selector){
	    var $elems = selector ? $(this).find(selector) : $(this).children(),
	        $parents = $elems.parent();

	    $parents.each(function(){
	        $(this).children(selector).sort(function(){
	            return Math.round(Math.random()) - 0.5;
	        }).remove().appendTo(this);
	    });

	    return this;
	};



	function playFirstTrack (nebula) {
		// play the first track
		var $trackFirst = $('#results li:first');
		
		var permalinkTrackFirst = $trackFirst.find('.permalink').html();
		insertPlayer($trackFirst, permalinkTrackFirst, nebula);
		$trackFirst.addClass('with-player');
	}

	/*
	** Embed the Widget and Play next one when this one finishes
	*/

	function insertPlayer ($li, permalink, nebula) {
			
		// pause already playing player
		$('.playing a.sc-pause').click();
	
		// append widget container with the widget
		if ($li.find('.widget-container').length < 1 ) {
			$li.append('<div class="widget-container"></div>');
		};

		//console.log($li[0].className);

		if ( $li.find('.sc-player.widget-container.playing').length < 1 ) {
			$.scPlayer.defaults.onDomReady = null;

			// remove existing player
			$('.sc-player:not("li.with-player .sc-player")').remove();

			// insert the player
			$('div.widget-container').scPlayer({
			  links: [{url: permalink, title: permalink}],
			  autoPlay  :   true
			  //randomize: true
			});
			$('.sc-logo-dark').hide();
			$li.find('.sc-logo-dark').show();

			// pause already playing player
			$('.playing a.sc-pause').click();

			// play player
			$('a.sc-play').click();

			// when player finishes playing click on next li to insert next player
			$(document).bind('scPlayer:onMediaEnd', function(event, track){						
			  $li.next('#results li').find('a.track-title').trigger('click'); 
			}); 

		}
		$('.sc-pause').removeClass('hidden');	
	}


	function infiniteScroll (nebulaForScroll, i, minBpm, maxBpm) {
			
			//var nebulaForScroll = nebulaForScrollGetVar(nebulaForScroll, i, minBpm, maxBpm);
			console.log('inifinite scroll updated: - ' + i + ' - ' + nebulaForScroll);
			$(window).scroll(function(){				
			    if($(window).scrollTop() == $(document).height() - $(window).height()) {	
			    	$('.oops').remove();

			    	var $currentNebula = $('.current-nebula a');	
			    	var nebulaForScroll = $currentNebula.text();
			    	var minBpm = $currentNebula.attr('data-min-bpm');
					var maxBpm = $currentNebula.attr('data-max-bpm');			       

			        var filterTracksInfinite = {   
			        			bpm: { from: minBpm, to: maxBpm }, 			        			
			        			genres: 'psytrance',
			        			limit: amountOfTracks,
			        			offset: i	
			        			};
				    if ( ($('#loadmoreajaxloader').attr('style') == 'display: none;') ) {   	
				    	$('div#loadmoreajaxloader').show();
				    	console.log('infiniteScrollNebula : ' + nebulaForScroll);
				       	
				       	// make sure i is reset on new nebula. otherwise increment 
				       	if ( $('body').hasClass('init') ) {
				       		i = amountOfTracks;
				       	} else {
				       		i = i+amountOfTracks;
				       	}

				       	$('body').removeClass('init');

				       	populate(filterTracksInfinite, nebulaForScroll, i);	 				     
			       };

			    } // end if			    		 
			});
		$('body').attr('data-finished-loading', '');
	}


	function insertPlayerOnTitleClick () {
		// On track Title click
    	$('#results li a.track-title').click(function (e) {
	    	e.preventDefault();
	    	
	    	// remove existing with-player classes
	    	$('#results li').removeClass('with-player');		    	

	    	var $li = $(this).parent('li');
	    	var permalink = $li.find('.permalink').html();
    		// Embed the widget
    		
    		// add class with-player to this li
    		$li.addClass('with-player');
    		insertPlayer($li, permalink);
    			    	
	    });
	}


	function removeDuplicates () {
		
		var seen = {};
		$('.track-title').each(function() {
		    var txt = $(this).text();
		    if (seen[txt])
		        $(this).parent('li').remove();
		    else
		        seen[txt] = true;
		});
		// body...
	}


	// Events/Actions

	// Create a random Nebula
	generateRandomNebula();
	//initially populate the tracks
	setCurrentNebula();

	// On Nebula Button Click 
	$('a.btn-nebula').click(function (e) {
		e.preventDefault();
		var $nebulaButton = $(this);		

		//remove existing current-nebula classes
		$('.nebulas li').removeClass('current-nebula');
		// add class current-nebula to the current button
		$nebulaButton.parent('li').addClass('current-nebula');

		setCurrentNebula();
		
	});

	// On Try Again Click
    $('#try-again').click(function (e) {
    	e.preventDefault();
    	// First, let's clear the area if there were previous results from other nebulas:
    	//$('#results').html('');
    	populate(filterTracks, nebula);    		
    });

    

    setTimeout(function(){
    	$('h1').slideUp();
    	$('.logo').mouseenter(function (){
    		$('h1').slideDown();
    	});
    	$('.logo').mouseleave(function (){
    		$('h1').slideUp();
    	});
    	

	},10000);

    setTimeout(function(){
    	// delay the display of twitter and facebook buttons
    	$('.ft').show();
	},3000);

 //    if ($(window).width() < 960) {
	// 	$('header').hide();
	// }

	if (matchMedia('only screen and (max-width: 980px)').matches) {
	  $('h1').hide();
	}

});
