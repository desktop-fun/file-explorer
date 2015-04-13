global.$ = $;
global.user_configs = require('./user-config.json');

var abar = require('address_bar');
var folder_view = require('folder_view');
var path = require('path');
var shell = require('nw.gui').Shell;

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
      shell.openItem(mime.path);
    }
  });

  addressbar.on('navigate', function(dir) {
    folder.open(dir);
  });
});

