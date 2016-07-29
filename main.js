/**
 * Upload files to AWS bucket
 *
 * var uploader = AwsUploader({
 *   bucket: <bucket name>,
 *   key: <path + file name + extension>,
 *   AWSAccessKeyId: <aws access key id>,
 *   acl: <permissions e.x. 'public-read'>,
 *   success_action_redirect: <redirect url on aws upload success>,
 *   signature: <signature>,
 *   contenttype: <Content-Type e.x. image/jpeg>,
 *   fileAdded: <event: when a file gets added using the open() function>,
 *   success: <event: when the upload finishes successfuly>,
 *   error: <event: when the upload fails>
 * });
 *
 * uploader.upload(files[0].name, files[0].blob);
 */

(function (define) {
    define(function (require, exports, module) {
        var $ = require('jquery'),
            _ = require('underscore');

        exports.create = function (options) {
            var _data, _options;

            _options = options;

            // Initialize form data based on the given options
            _data = new FormData();
            _data.append("key", options.key);
            _data.append("AWSAccessKeyId", options.AWSAccessKeyId);
            _data.append("acl", options.acl);
            _data.append("policy", options.policy);
            _data.append("signature", options.signature);
            _data.append("Content-Type", options.contenttype || options["Content-Type"]);

            // Add a hidden file input which can be triggered to open a file dialog
            $('body').append('<input type="file" style="display: none;" />');
            var _input = $('body').children().last();
            _input.change(function (e) {
                var file = _input[0].files[0];
                _options.fileAdded(file);
            });

            return {

                /**
                 * Open the file picker to select a file
                 */
                open: function () {
                    if (!_input) {
                        return console.error('Uploader not initilized');
                    }
                    _input.trigger('click');
                },

                /**
                 * Generates a thumbail based on the added file
                 * returns it usign a callback
                 */
                thumbnail: function (callback) {
                    if (!_input) {
                        return console.error('Uploader not initilized');
                    }
                    if (_input[0].files.length == 0) {
                        return console.error('No files added to uploader');
                    }
                    var file = _input[0].files[0];
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        callback(e.target.result);
                    };
                    reader.readAsDataURL(file);
                },

                /**
                 * Upload the added image to AWS
                 */
                upload: function (options) {
                    _options = _.extend(_options, options);

                    if (!_input) {
                        return console.error('Uploader not initilized');
                    }
                    if (_input[0].files.length == 0) {
                        return console.error('No files added to uploader');
                    }

                    var file = _input[0].files[0];
                    _data.append("file", file);

                    var req = new XMLHttpRequest();
                    req.open("POST", 'https://' + _options.bucket + '.s3.amazonaws.com/', true);
                    req.onload = function(e) {
                        if (req.status == 200 || req.status == 204 || req.status == 303) {
                            _options.success('https://' + _options.bucket + '.s3.amazonaws.com/' + _options.key);
                        } else {
                            _options.error(e);
                        }
                    };
                    req.send(_data);
                }
            }
        };
    });
}(typeof define === 'function' && define.amd ? define : function (cb) {
    cb(require, exports, module);
}));

