/*
**  Fancybox
** 
**  Add a gallery preview effect for all images
**  except those with 'nofancybox' classes.
**
**  Addtion: width adjustment for images with markdown syntax
**
**  ![Hello World.](/images/helloworld.png?width=50%)
**
**  There are two bounaries of image width:
**  1. Given number as percentage of pc screen width
**  2. 100% of screen width on mobile devices
**  
**  Kai. July 2017.
*/
$(document).ready(function() {
  $('img').each(function() {
    if ($(this).parent().hasClass('fancybox')) return;
    if ($(this).hasClass('nofancybox')) return;
    var alt = this.alt;
    if (alt) $(this).after('<span class="caption">' + alt + '</span>');

    // *.jpg?width=52    -->
    // *.jpg?width=0.52  --> width: 0.52 * parent_width

    // add resizing functions
    var src = $(this).attr('src')
    if (src.indexOf('?width=') != -1) {
        var _w = this.width
        var lw = $("#layout").width()
        var _max = lw
        var re = /\.(jpg|jpeg|gif|png)\?width=((\.?\d)*)/
        try{
          var target_w = src.match(re)[2]
          if (target_w > 1) {
            target_w =  target_w / 100
          }
          if (lw > 768) {
            _max = target_w * lw
          }
        }
        catch(e){
          // console.log("Wrong Regrex match for width")
        }
        
        var w = Math.min(_w, _max)
        // console.log(w, _w, _max, src)
        $(this).css({"width":  w + "px"})
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
