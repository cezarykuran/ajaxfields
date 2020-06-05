ajaxfields = {
  mods : {},

  load : function(ns, host) {
     ajaxfields.mods[ns] = {
        'i' : -1,
        'cache' : '',
        'host' : host
     }
  },

  onkeyup : function(o, ns) {
    if(o.value.length > 0) {
      if(ajaxfields.mods[ns].i == -1)
        ajaxfields.mods[ns].i = window.setInterval(ajaxfields.chk, 1500, o, ns)
    }
    else if(ajaxfields.mods[ns].i != -1) {
      window.clearInterval(ajaxfields.mods[ns].i)
      ajaxfields.mods[ns].i = -1
    }
  },

  chk : function(o, ns) {
    if(o.value != ajaxfields.mods[ns].cache) {
      ajaxfields.mods[ns].cache = o.value
      $.post(
        ajaxfields.mods[ns].host,
        {s : o.value},
        function(d) {ajaxfields.ajax(d, ns)},
        'json'
      )
    }
  },

  ajax : function(d, ns) {
    var $o = $('#' + ns).children('.ajaxfields-list')

    if(d.status == 'error')
      $o.html(d.data)
    else {
      $o.html('')
      $.each(d.data, function(){
        $o.append(
          $(document.createElement('DIV'))
            .addClass('ajaxfields-list-item')
            .attr('onclick', "ajaxfields.onclick(this)")
            .attr('data-id', this.id)
            .attr('data-name', this.name)
            .append([
              $(document.createElement('I'))
                .addClass('glyphicon glyphicon-unchecked'),
              $(document.createElement('I'))
                .addClass('glyphicon glyphicon-check'),
              $(document.createElement('SPAN'))
                .addClass('ajaxfields-list-item-id')
                .html(this.id),
              $(document.createElement('SPAN'))
                .addClass('ajaxfields-list-item-name')
                .html(this.name)
          ])
        )
      })
    }
  },

  onclick : function(o) {
    var $o = $(o)

    if($o.hasClass('ajaxfields-list-item-checked')) {
      $o.removeClass('ajaxfields-list-item-checked')
    }
    else {
      $o.addClass('ajaxfields-list-item-checked')
    }

    var data = {}
    $.each($o.parent().children(), function(){
      var $i = $(this)
      if($i.hasClass('ajaxfields-list-item-checked')) data[parseInt($i.attr('data-id'))] = $i.attr('data-name')
    })
    Shiny.setInputValue($o.closest('.ajaxfields-container').attr('id'), data);
  }
}
