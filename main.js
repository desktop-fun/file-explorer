// -*- js-indent-level: 2 -*-

global.$ = $;
global.user_configs = require('./user-config.json');

var abar = require('my/address_bar');
var folder_view = require('my/folder_view');
var nav_panel = require('my/nav_panel');
var path = require('path');
var gui = require('nw.gui');
var xdg_trashdir = require('xdg-trashdir');
var trash = require('trash');
var fs = require('fs');

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
    addressbar.set(dir);
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
    switch (item) {
       case 'Open':
           folder.open(target);
           addressbar.set(target);
           break;
       case 'New':
           
           break;
       case 'New Folder':
           var cur_dir = addressbar.current_path;
           var untitled = 'Untitled Folder';
           var filename = path.join(cur_dir, untitled );
           var filename2 = filename;
           var count =2;
           while (fs.existsSync(filename2)){
               console.log(filename2);
               filename2 = path.join(cur_dir, untitled.concat(' ',count++));
               console.log(filename2);
           }
           fs.mkdir(filename2, function(err){
              if(err) throw err;
              addressbar.emit('navigate', cur_dir);
           });
           break; 
       case 'Delete':
           trash([path.join(target)], function(err){
              if (err) {
                 if (err = 'ENOTEMPTY') alert("ENOTEMPTY!");
                 throw err;
           }
           addressbar.emit('navigate', path.dirname(target));
           });
           break;
       case 'Cut':break;
       case 'Copy':break;
       case 'Rename':
           fs.rename(target,path.join(path.dirname(target),"New folder"),function(err){
               if (err) {
                  throw err;
               }
               console.log("Rename successfully");
               addressbar.emit('navigate',path.dirname(target));
           });
           break;
       case 'Open Terminal':break;
       case 'Properties':break; 
       case 'Folder Properties':break;
       default: 
           break;
    }
  }

  var file_ctx_menu = new gui.Menu();
  file_ctx_menu.target = "none";
  ['Open', 'Delete', 'Cut', 'Copy','Rename','Properties']
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
  });

  $("#Home").on('click', function(){
    folder.open(open_dir);
    addressbar.set(open_dir);
  });

  $("#Trash").on('click',function(){
    if (process.platform === 'linux') {
        xdg_trashdir(null, function(err, trash_dir){
            if (err) {
                console.log(err);
            } else {
                if (!fs.existsSync(trash_dir)) {
                    trash_dir = "<about:trash-empty>";
                } else {
                    trash_dir = path.join(trash_dir, "files");
                }
                folder.open(trash_dir);
                addressbar.set("Trash");
           }
       });
    } else if(process.platform === 'win32') {
        
    };
  });
});

