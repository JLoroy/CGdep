(function($) {
var opt;
$.fn.printThis = function(options) {
opt = $.extend({}, $.fn.printThis.defaults, options);
var $element = this instanceof jQuery ? this : $(this);
var strFrameName = "printThis-" + (new Date()).getTime();
if (window.location.hostname !== document.domain && navigator.userAgent.match(/msie/i)) {
// Ugly IE hacks due to IE not inheriting document.domain from parent
// checks if document.domain is set by comparing the host name against document.domain
var iframeSrc = "javascript:document.write(\"<head><script>document.domain=\\\"" + document.domain + "\\\";</script></head><body></body>\")";
var printI = document.createElement('iframe');
printI.name = "printIframe";
printI.id = strFrameName;
printI.className = "MSIE";
document.body.appendChild(printI);
printI.src = iframeSrc;
} else {
// other browsers inherit document.domain, and IE works if document.domain is not explicitly set
var $frame = $("<iframe id='" + strFrameName + "' name='printIframe' />");
$frame.appendTo("body");
}
var $iframe = $("#" + strFrameName);
// show frame if in debug mode
if (!opt.debug) $iframe.css({
position: "absolute",
width: "0px",
height: "0px",
left: "-600px",
top: "-600px"
});
// $iframe.ready() and $iframe.load were inconsistent between browsers
setTimeout(function() {
var $doc = $iframe.contents();
// import page stylesheets
if (opt.importCSS) $("link[rel=stylesheet]").each(function() {
var href = $(this).attr("href");
if (href) {
var media = $(this).attr("media") || "all";
$doc.find("head").append("<link type='text/css' rel='stylesheet' href='" + href + "' media='" + media + "'>")
}
});
// import style tags
if (opt.importStyle) $("style").each(function() {
$doc.find("head").append($(this));
});
//add title of the page
if (opt.pageTitle) $doc.find("head").append("<title>" + opt.pageTitle + "</title>");
// import additional stylesheet
if (opt.loadCSS) $doc.find("head").append("<link type='text/css' rel='stylesheet' href='" + opt.loadCSS + "'>");
// print header
if (opt.header) $doc.find("body").append(opt.header);
// grab $.selector as container
if (opt.printContainer) $doc.find("body").append($element.outer());
// otherwise just print interior elements of container
else $element.each(function() {
$doc.find("body").append($(this).html());
});
// capture form/field values
if (opt.formValues) {
// loop through inputs
var $input = $element.find('input');
if ($input.length) {
$input.each(function() {
var $this = $(this),
$name = $(this).attr('name'),
$checker = $this.is(':checkbox') || $this.is(':radio'),
$iframeInput = $doc.find('input[name="' + $name + '"]'),
$value = $this.val();
//order matters here
if (!$checker) {
$iframeInput.val($value);
} else if ($this.is(':checked')) {
if ($this.is(':checkbox')) {
$iframeInput.attr('checked', 'checked');
} else if ($this.is(':radio')) {
$doc.find('input[name="' + $name + '"][value=' + $value + ']').attr('checked', 'checked');
}
}
});
}
//loop through selects
var $select = $element.find('select');
if ($select.length) {
$select.each(function() {
var $this = $(this),
$name = $(this).attr('name'),
$value = $this.val();
$doc.find('select[name="' + $name + '"]').val($value);
});
}
//loop through textareas
var $textarea = $element.find('textarea');
if ($textarea.length) {
$textarea.each(function() {
var $this = $(this),
$name = $(this).attr('name'),
$value = $this.val();
$doc.find('textarea[name="' + $name + '"]').val($value);
});
}
} // end capture form/field values
// remove inline styles
if (opt.removeInline) {
// $.removeAttr available jQuery 1.7+
if ($.isFunction($.removeAttr)) {
$doc.find("body *").removeAttr("style");
} else {
$doc.find("body *").attr("style", "");
}
}
setTimeout(function() {
if ($iframe.hasClass("MSIE")) {
// check if the iframe was created with the ugly hack
// and perform another ugly hack out of neccessity
window.frames["printIframe"].focus();
$doc.find("head").append("<script> window.print(); </script>");
} else {
// proper method
$iframe[0].contentWindow.focus();
$iframe[0].contentWindow.print();
}
$element.trigger("done");
//remove iframe after print
if (!opt.debug) {
setTimeout(function() {
$iframe.remove();
}, 1000);
}
}, opt.printDelay);
}, 333);
};
// defaults
$.fn.printThis.defaults = {
debug: false, // show the iframe for debugging
importCSS: true, // import parent page css
importStyle: true, // import style tags
printContainer: true, // print outer container/$.selector
loadCSS: "", // load an additional css file
pageTitle: "", // add title to print page
removeInline: false, // remove all inline styles
printDelay: 333, // variable print delay
header: null, // prefix to html
formValues: true // preserve input/form values
};
// $.selector container
jQuery.fn.outer = function() {
return $($("<div></div>").html(this.clone())).html()
}
})(jQuery);
