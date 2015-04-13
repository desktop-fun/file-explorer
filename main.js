// -*- js-indent-level: 2 -*-

global.$ = $;

var abar = require('address_bar');
var folder_view = require('folder_view');
var nav_panel = require('nav_panel');
var path = require('path');
var shell = require('nw.gui').Shell;

$(document).ready(function() {
  var folder = new folder_view.Folder($('#files'));
  var addressbar = new abar.AddressBar($('#addressbar'));

  folder.open(process.cwd());
  addressbar.set(process.cwd());

  folder.on('navigate', function(dir, mime) {
    if (mime.type == 'folder') {
      addressbar.enter(mime);
    } else {
      shell.openItem(mime.path);
    }
  });

  addressbar.on('navigate', function(dir) {
    folder.open(dir);
  });

  // TODO xmove to nav_panel.js
  $('#toggle-view-btn').click(function(event){
    event.preventDefault();
    var files_view = $("#files");
    var toggle_btn_glyph = $("#toggle-view-btn span")

    if (files_view.attr('class').split(/\s+/)
        .some(function(cl) { return cl === "icon-view" })){
      files_view.addClass("list-view").removeClass("icon-view");
      toggle_btn_glyph.addClass("glyphicon-list").removeClass("glyphicon-th-large");
    }else{
      files_view.addClass("icon-view").removeClass("list-view")
      toggle_btn_glyph.addClass("glyphicon-th-large").removeClass("glyphicon-list")
    }
  })

});
