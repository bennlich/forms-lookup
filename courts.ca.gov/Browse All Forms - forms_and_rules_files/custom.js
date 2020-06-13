// JCC JavaScript Library
var count = 0;
var selectedMenu;
var lastSelectedMenu;

$(document).ready(function() {

	    var timestampPDF = Date.now();
    	var theHash = window.location.hash;
    	var idHash = document.URL.indexOf("#");
    	var pageURL = $(location).attr("pathname");
    
	if (theHash == '') {
		hasHash = false;
	} else {
		hasHash = true;
	}
//--------------------------------------------------------------------------------------------
    //Remove border-right from last menu item
    
	// top-nav
	$('.navbar-default .navbar-nav > li:last-child').addClass('last');
    	$('.dropdown-menu hidden-xs > li:last-child').addClass('endstop');
        
//---------------------------------------------------------------------------------------------     
    //Set Story Panels on home page widths/settings
//	$('.storyPanels .storyPanel:last-child').addClass('lastStory');
//	if ($('.storyPanels .storyPanel').length == 2)
//	{  
//        $('.storyPanels .storyPanel:first-child').removeClass("col-lg-4").addClass("col-lg-6");
//		$('.storyPanels .storyPanel:last-child').removeClass("col-lg-4").addClass("col-lg-6");
//	}    
    
//---------------------------------------------------------------------------------------------     
    //make sure that PDF links open in new window
    $("a[href$='.pdf']").attr("target", "_blank");
    $("a[href$='.PDF']").attr("target", "_blank");
    
//---------------------------------------------------------------------------------------------
	//append file type icons with alt text for links
	$("a[href$='.pdf']").after('<img class=\"filetype-icon\" src=\"/images/icon-pdf.gif\" alt=\"PDF file type icon\">');
	$("a[href$='.PDF']").after('<img class=\"filetype-icon\" src=\"/images/icon-pdf.gif\" alt=\"PDF file type icon\">');
	$("a[href$='.xls']").after('<img class=\"filetype-icon\" src=\"/images/icon-xls.gif\" alt=\"XLS file type icon\">');
	$("a[href$='.XLS']").after('<img class=\"filetype-icon\" src=\"/images/icon-xls.gif\" alt=\"XLS file type icon\">');
	$("a[href$='.xlsx']").after('<img class=\"filetype-icon\" src=\"/images/icon-xls.gif\" alt=\"XLS file type icon\">');
	$("a[href$='.XLSX']").after('<img class=\"filetype-icon\" src=\"/images/icon-xls.gif\" alt=\"XLS file type icon\">');
	$("a[href$='.doc']").after('<img class=\"filetype-icon\" src=\"/images/icon-doc.gif\" alt=\"DOC file type icon\">');
	$("a[href$='.DOC']").after('<img class=\"filetype-icon\" src=\"/images/icon-doc.gif\" alt=\"DOC file type icon\">');
	$("a[href$='.docx']").after('<img class=\"filetype-icon\" src=\"/images/icon-doc.gif\" alt=\"DOC file type icon\">');
	$("a[href$='.DOCX']").after('<img class=\"filetype-icon\" src=\"/images/icon-doc.gif\" alt=\"DOC file type icon\">');
	$("a[href$='.pps']").after('<img class=\"filetype-icon\" src=\"/images/icon-ppt.gif\" alt=\"PPT file type icon\">');
	$("a[href$='.PPS']").after('<img class=\"filetype-icon\" src=\"/images/icon-ppt.gif\" alt=\"PPT file type icon\">');
	$("a[href$='.ppt']").after('<img class=\"filetype-icon\" src=\"/images/icon-ppt.gif\" alt=\"PPT file type icon\">');
	$("a[href$='.PPT']").after('<img class=\"filetype-icon\" src=\"/images/icon-ppt.gif\" alt=\"PPT file type icon\">');
	$("a[href$='.pptx']").after('<img class=\"filetype-icon\" src=\"/images/icon-ppt.gif\" alt=\"PPT file type icon\">');
	$("a[href$='.PPTX']").after('<img class=\"filetype-icon\" src=\"/images/icon-ppt.gif\" alt=\"PPT file type icon\">');

//---------------------------------------------------------------------------------------------
    //add timestamp to PDF 
//	$("a[href$='.pdf']").each(function() {
//	   var $this = $(this);       
//	   var _href = $this.attr("href"); 
//	   $this.attr("href", _href + '?' + timestampPDF);
//	});
	
//	$("a[href$='.PDF']").each(function() {
//	   var $this = $(this);       
//	   var _href = $this.attr("href"); 
//	   $this.attr("href", _href + '?' + timestampPDF);
//	});    
    
//---------------------------------------------------------------------------------------------     
    //Process the Court Locations form or the Find My Court form
	$( "#find" ).submit(function() {
		if ( $( '#query' ).val() == "Enter city or zip" ) {
		    $( '#query' ).val("");		
		 }
		return true;
	});

//---------------------------------------------------------------------------------------------     
    // initialize external links    
	$('a[href^="http"]:not([href*="jud.ca.gov"],[href*="courts.ca.gov"],[href*="courtinfo.ca.gov"],[href*="sucorte.ca.gov"],[href*="aocweb"],[href*="careers.jud.ca.gov"],[href*="t.co"],[href*="twitter.com"],[href*="shar.es"],[href*="bit.ly"],[href*="ow.ly"],[href*="wpc.1a57.edgecastcdn.net/001A57/eop/jc"],[href*="feeds.feedburner.com"],[href*="flickr.com"],[href*="jcc.granicus.com"],[href*="jcc.legistar.com"],[href*="media.legistar.com"])').not(':has(img)').attr('target', '_blank').after('<a title="External link – View our Terms of Use" class="external" href="/11529.htm#Linking_and_Third"><img class="external-icon" src="/images/icon-ext.gif" alt="External link icon"></a>');
	
	// remove external links from exceptions
	$('.btn').parent().next('.external').hide(); // Bootstrap button wrapped with anchor
	$('.btn').next('.external').hide(); // Bootstrap button applied to anchor
			
//---------------------------------------------------------------------------------------------     
    //Accordions
    $('.accordion-wrapper .collapseall_button').click(function(){
        $wrapper = $(this).parents('.accordion-wrapper');        
        $('.panel-collapse.in', $wrapper).collapse('hide');
		var id = this.id;
		var idExpand = id.replace("collapse","expand");
		document.getElementById(id).setAttribute('aria-expanded', 'false');
		document.getElementById(idExpand).setAttribute('aria-expanded', 'false');
        return false;
    });
    $('.accordion-wrapper .expandall_button').click(function(){
        $wrapper = $(this).parents('.accordion-wrapper');
        $('.panel-collapse:not(".in")', $wrapper).collapse('show');
		var id = this.id;
		var idCollapse = id.replace("expand","collapse");
		document.getElementById(id).setAttribute('aria-expanded', 'true');
		document.getElementById(idCollapse).setAttribute('aria-expanded', 'true');
        return false;
    }); 
    
	$('.panel-heading').click(function() {     
		$(this).toggleClass('active');
    });
    
//---------------------------------------------------------------------------------------------     
    //Page Layout
	//apply zebra striping {
	$("#mainPanel table tr:even, #mainPanel table.simple tr:even").each(function(){
		$(this).addClass("even");
	});    
//---------------------------------------------------------------------------------------------   
    //Show/Hide
    //show/Hide functionality    
    $('div.showhide ul a').click(function () {
		var tabGroup = $('.showhide:has(#' + $(this).attr('id') + ')');
		$('.current', tabGroup).removeClass('current');
		$(this).parent().addClass('current');
		$('.showHideContent', tabGroup).hide();
		$('#' + $(this).attr('id') + 'content').show();
	});

	//show default item on load (first item, or item based on url hash)
	$('div.showhide').each(function() {
		tabGroup = $(this);
		tabSections = $('.showHideContent', tabGroup);
		tabSections.hide();
		if (hasHash && $(theHash, tabGroup).length > 0) {
			$(theHash, tabGroup).click();
		} else {
			tabSections.eq(0).show();
			$('#showHideNavigation ul li', tabGroup).eq(0).addClass('current');
		}		
	});  

    
//---------------------------------------------------------------------------------------------    
    //Tabs
	//show default tab on load - standard tabs
    /*
    if (idHash != -1)  {
        var hash = document.URL.substring(idHash + 1);
        $(".nav-tabs").children("li").each(function() {
            var id = $(this).find("a").attr("href").substring(1);
            var $container = $("#" + id);
            $(this).removeClass("active");
            $container.removeClass("active");
            if (id == hash || $container.find("#" + hash).length) {
                $(this).addClass("active");
                $container.addClass("active");
           }
        })
    } else {
        $( ".nav-tabs li:first-child" ).addClass( "active" );
        $( ".tab-content div.tab-pane:first-child" ).addClass( "active" );
    }
    // load first accordion for small screens
    $("#accordionTab div.panel div.panel-heading:first-child h4 a").removeClass('collapsed');
    $("#accordionTab div.panel div.panel-heading:first-child h4 a").attr( 'aria-expanded','true' );
    var id = $("#accordionTab div.panel div.panel-heading:first-child h4 a").attr('href').substring(1);
    var $container = $("#" + id);
    $container.addClass("in");
    $container.attr( 'aria-expanded','true' );
    */

 //---------------------------------------------------------------------------------------------   
    //Accordions - for deep linking only.  No accordion will automatically open
    var intTest = 0;
    if (idHash != -1)  {
        var hash = document.URL.substring(idHash);
        var panelID = 'panel'+hash.split('#')[1];
        if ( hash.match('#') ) {
            $('#'+hash.split('#')[1]).collapse('show');
            $('#'+panelID).addClass( "panel-active");
            $('html').animate({scrollTop:$('#'+panelID).offset().top}, 'fast'); //IE, FF
            $('body').animate({scrollTop:$('#'+panelID).offset().top}, 'fast'); //chrome, don't know if Safari works            
        }
    }
});

/*
 * MAIN MENU INTERIM FIX PT1
 * Renders hidden backdrop as a hotspot to allow main menu dropdown dismissal on large touch devices
 * FIXME: Revisit how main menu should be implemented for responsive/touch device support
 */
$(document).on('touchend', '.nav .dropdown-toggle', function(e) {
    e.preventDefault(); // Disable overview page clickthrough on first touch

    selectedMenu = $(this).html();

    if (count == 0) {
        // If first touch on menu...
        displayMainMenuBackDrop(this); // First click displays dropdown and backdrop only
        lastSelectedMenu = $(this).html(); // Remember last selected menu
        count += 1; // Register first touch for menu
    } else {
        // If same menu touched again or if different...
        if (selectedMenu == lastSelectedMenu) {
            count = 0; // Reset touch tracking
            $('#jcc-dropdown-backdrop').remove();
            location.href = $(this).attr('href'); // Allow clickthrough to overview page
        } else {
            displayMainMenuBackDrop(this); // Display backdrop under different menu selected
            lastSelectedMenu = $(this).html();
        }
    }
});

/*
 * MAIN MENU INTERIM FIX PT2
 * Dropdown menu backdrop renderer
 * @param selected    Currently selected menu passed from click event handler
 */
function displayMainMenuBackDrop(selected) {
    $('#jcc-dropdown-backdrop').remove(); // Remove existing backdrops
    var backDrop = $(document.createElement('div')).attr('id', 'jcc-dropdown-backdrop').addClass('modal-backdrop'); // Bootstrap modal backdrop - dropdown-backdrop does not work
    var ddContainer = $(selected).closest('.dropdown'); // Dropdown container context
    backDrop.appendTo(ddContainer); // Set Bootstrap modal to overlay everything but the open dropdown menu
}

/*
 * MAIN MENU INTERIM FIX PT3
 * Dismisses active main menu dropdown and backdrop on large touch devices
 */
$(document).on('touchend', '#jcc-dropdown-backdrop', function(e) {
    count = 0; // Reset touch tracking

    // Delay backdrop removal to allow time for user to remove touch
    setTimeout(function() {
        $('.nav .dropdown-menu').hide(); // Suppress any visible dropdowns
        $('.nav .dropdown-menu').removeAttr('style'); // Reinitialize dropdown state
        $('#jcc-dropdown-backdrop').remove(); // Remove Bootstrap modal backdrop
    }, 300);
});

/*
 * MAIN MENU INTERIM FIX PT4
 * Additional main menu dropdown event handler to clean-up JCC backdrop behaviors
 */
$(document).on('touchend', '.nav .dropdown-menu', function(e) {
    count = 0;
    $('#jcc-dropdown-backdrop').remove();
});


/*
 * Checks if element is visible in browser viewing area
 */
function elemIsVisible(el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document. documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document. documentElement.clientWidth)
    );
}


/*
 * Applies behaviors during page scrolling
 * @param .slideanim  Classname to slide-reveal an element during page scrolling
 */
function slideObj() {
    $('.slideanim').each(function () {
        var isVisible = elemIsVisible(this);
        if (isVisible) {
            $(this).addClass('slide');
        }
    });
}


$(document).ready(function () {
    /*
     * Toggles content visibility (compliant for accessibility)
     * @param .showMore        Classname to enable event handling for action element
     * @param .content-more    Classname to enable target content for event handling to manipulate
     * @param .hidden          Classname to hide content
     * @param smClasses        String used to identify user-defined classname for target
     * @param target           User-defined classname to link action with target content - sibling class that follows .content-more
     */
    $('.showMore').click(function() {
        var smClasses = $(this).attr('class');
        smClasses = smClasses.split(' ');
        var target = '.content-more.' + smClasses[1];
        var isHidden = $(target).hasClass('hidden');
        if (isHidden) {
            $(target).removeClass('hidden').css('display','none').slideDown(500);
        } else {
            $(target).slideUp(500, function(){
                $(this).addClass('hidden');
            });
        }
    });
    // Keyboard support
    $('.showMore').keypress(function(e){
        if(e.which == 13){//Enter key pressed
            $(this).click(); //Trigger search button click event
        }
    });


    /*
     * Toggles content visibility but allows only one block of text in a grouping (compliant for accessibility)
     * @param .toggle          Classname to enable event handling for action element
     * @param .inlineToggle    Classname to enable target content for event handling to manipulate
     * @param .hide            Classname to hide target content from viewing but not from screen readers
     * @param tClasses         String used to identify user-defined classname for target
     * @param selectedTarget   User-defined classname to link action with target content - sibling class that follows .inlineToggle
     */
    $('.toggle').click(function() {
        var tClasses = $(this).attr('class');
        tClasses = tClasses.split(' ');
        var target = '.inlineToggle.' + tClasses[1];
        var isTargetHidden = $(target).hasClass('hide');
        $('.inlineToggle').each(function () {
            var isHidden = $(this).hasClass('hide');
            var isAlreadySelected = $(this).hasClass(tClasses[1]);
            if (!isHidden && !isAlreadySelected) {
                $(this).slideUp(500, function() {
                    $(this).removeAttr('style').addClass('hide');
                });
            }
        });
        if (isTargetHidden) {
            $(target).css('display','none').removeClass('hide').slideDown(500);
        }
    });
});