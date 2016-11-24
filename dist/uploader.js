"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var S3Uploader = function () {
    function S3Uploader(options) {
        var _this = this;

        _classCallCheck(this, S3Uploader);

        this.options = options;
        // Initialize form data based on the given options
        this.data = new window.FormData();
        this.data.append("AWSAccessKeyId", options.AWSAccessKeyId);
        this.data.append("acl", options.acl);
        this.data.append("policy", options.policy);
        this.data.append("signature", options.signature);
        this.data.append("Content-Type", options.contenttype || options["Content-Type"]);
        // Add a hidden file input which can be triggered to open a file dialog
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.style = 'display:none';
        input.id = 's3upload';
        document.body.appendChild(input);
        input.addEventListener('change', function (e) {
            return _this.onChange(e);
        });
        this.input = input;

        this.upload = this.upload.bind(this);
        this.open = this.open.bind(this);
    }

    _createClass(S3Uploader, [{
        key: "upload",
        value: function upload(newKey) {
            var key = newKey || this.options.key;
            this.data.append("file", this.file);
            this.data.append("key", key);
            var _options = this.options,
                bucket = _options.bucket,
                success = _options.success,
                error = _options.error;


            var req = new window.XMLHttpRequest();
            req.open("POST", "https://" + bucket + ".s3.amazonaws.com/", true);
            req.onload = function (e) {
                if (req.status >= 200 && req.status < 400) {
                    success("https://" + bucket + ".s3.amazonaws.com/" + key);
                } else {
                    error(e);
                }
            };
            req.send(this.data);
        }
    }, {
        key: "open",
        value: function open() {
            this.input.click();
        }
    }, {
        key: "onChange",
        value: function onChange(e) {
            var _this2 = this;

            //const promise = new Promise(); // used for user defined callback
            var onChange = this.options.onChange || function () {};
            var file = e.target.files[0];
            // When there is no width and height given, don't scale the image
            var _options2 = this.options,
                width = _options2.width,
                height = _options2.height;

            if (!width || !height) {
                this.file = file;
                onChange(file);
            } else {
                return this.resizeImage(file, width, height).then(function (file) {
                    _this2.file = file;
                    onChange(file);
                    return file;
                });
            }
        }
    }, {
        key: "fileToDataUrl",
        value: function fileToDataUrl(file) {
            return new Promise(function (resolve, reject) {
                var reader = new window.FileReader();
                reader.onload = function (e) {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        }
    }, {
        key: "resizeImage",
        value: function resizeImage(file, width, height) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                var canvas = document.createElement('canvas');
                canvas.style = 'display:none';
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");

                _this3.fileToDataUrl(file).then(function (src) {
                    var image = new window.Image();
                    image.onload = function () {
                        var imageWidth = image.width;
                        var imageHeight = image.height;
                        var newWidth = void 0,
                            newHeight = void 0;

                        if (imageWidth > imageHeight) {
                            newWidth = height / imageHeight * imageWidth;
                            newHeight = height;
                        } else {
                            newHeight = width / imageWidth * imageHeight;
                            newWidth = _this3.options.width;
                        }

                        ctx.drawImage(image, -(newWidth - width) / 2, -(newHeight - height) / 2, newWidth, newHeight);

                        // Convert the canvas to dataurl and blobfile to be send
                        // to the client using this module. So that it can be used
                        // to upload it to a server for example
                        var dataurl = canvas.toDataURL("image/png");
                        var blobBin = window.atob(dataurl.split(',')[1]);
                        var array = [];
                        for (var i = 0; i < blobBin.length; i++) {
                            array.push(blobBin.charCodeAt(i));
                        }
                        resolve(new window.Blob([new window.Uint8Array(array)], { type: 'image/png' }));
                    };
                    // Set the image object source, onload will be called afterwards
                    image.src = src;
                });
            });
        }
    }, {
        key: "toDataUrl",
        value: function toDataUrl(src) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                var file = _this4.input.files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        }
    }]);

    return S3Uploader;
}();

exports.default = S3Uploader;