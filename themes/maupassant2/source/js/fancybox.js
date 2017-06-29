$(document).ready(function() {
  $('img').each(function() {
    if ($(this).parent().hasClass('fancybox')) return;
    if ($(this).hasClass('nofancybox')) return;
    var alt = this.alt;
    if (alt) $(this).after('<span class="caption">' + alt + '</span>');
    // add resizing functions
    var src = $(this).attr('src')
    if (src.indexOf('?width=') != -1) {
        var _w = this.width
        var lw = $("#layout").width()
        var _max = lw
        var re = /\.(jpg|jpeg|gif|png)\?width=(\d{1,2})/
        try{
          if (lw > 768) {
            _max = src.match(re)[2] * lw / 100
          }
        }
        catch(e){
          console.log("Wrong Regrex match for width")
        }
        console.log(_max, _w)
        var w = Math.min(_w, _max)
        $(this).css({"width":  w + "px"})
        // $(this).attr('src', src.replace(/\?width=(\d{1,2}$)/, ''))
    }

    $(this).wrap('<a href="' + ($(this).attr('data-src') == null ? this.src : $(this).attr('data-src')) + '" title="' + alt + '" class="fancybox"></a>');
  });
  $(this).find('.fancybox').each(function(){
    $(this).attr('rel', 'article');
  });
});
$(document).ready(function() {
  // $("a[href*='.jpg'],a[href*='.png'],a[href*='.gif'],a[href*='.webp']").attr('rel', 'gallery').fancybox({
  // change `ends with` to `contains`
  $("a[href*='.jpg'],a[href*='.jpeg'],a[href*='.png'],a[href*='.gif']").attr('rel', 'gallery').fancybox({
    helpers : {
    title: { type: 'inside'}
    }
  });
});
