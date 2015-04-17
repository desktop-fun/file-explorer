// -*- js-indent-level: 2 -*-

global.$ = $;
global.user_configs = require('./user-config.json');

var abar = require('my/address_bar');
var folder_view = require('my/folder_view');
var nav_panel = require('my/nav_panel');
var path = require('path');
var gui = require('nw.gui');

$(document).ready(function() {
  var folder = new folder_view.Folder($('#files'));
  var addressbar = new abar.AddressBar($('#addressbar'));

  var open_dir = process.cwd();
  if (process.platform === 'linux') {
    open_dir = process.env.HOME;
  }

  folder.open(open_dir);
  addressbar.set(open_dir);

  folder.on('navigate', function(dir, mime) {
    if (mime.type == 'folder') {
      addressbar.enter(mime);
    } else {
      gui.Shell.openItem(mime.path);
    }
  });

  addressbar.on('navigate', function(dir) {
    folder.open(dir);
  });

  // TODO move to nav_panel.js
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

  // Context menu
  // TODO move to separate files and maybe make better interface for menus.
  var ctx_menu_click_callback_stub = function(target, item){
    console.log("CTX Menu: Action [" + item + "] invoked on [" + target + "]");
  }

  var file_ctx_menu = new gui.Menu();
  file_ctx_menu.target = "none";
  ['Open', 'Delete', 'Cut', 'Copy','Properties']
    .forEach(function(item_name){
      file_ctx_menu.append(
        new gui.MenuItem({
          type: "normal",
          label: item_name,
          click: function(){
            ctx_menu_click_callback_stub(file_ctx_menu.target, item_name);
          }
        }))
    });

  folder.on('contextmenu', function(file_element, ev){
    file_ctx_menu.target = file_element.attr('data-path');
    file_ctx_menu.popup(ev.pageX, ev.pageY);
    return false;
  })

  var files_view_ctx_menu = new gui.Menu();
  files_view_ctx_menu.target = "none";
  ['New', 'New Folder', '|', 'Open Terminal', 'Folder Properties']
    .forEach(function(item_name){
      var type = "normal";
      if (item_name === '|'){
        type = "separator"
      };
      files_view_ctx_menu.append(
        new gui.MenuItem({
          type: type,
          label: item_name,
          click: function(){
            ctx_menu_click_callback_stub(files_view_ctx_menu.target, item_name);
          },
        }));
    });

  // can't use "#files" as it serves as delegator for ".file"
  $("#files-row").on('contextmenu', function(ev){
    $("#files").children('.focus').removeClass('focus');
    files_view_ctx_menu.target = "<files view blank>"
    files_view_ctx_menu.popup(ev.pageX, ev.pageY);
    return false;
  })
});

