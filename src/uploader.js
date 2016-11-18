export default class S3Uploader {

  constructor(options) {
    this.options = options;
    // Initialize form data based on the given options
    this.data = new window.FormData();
    this.data.append("key", options.key);
    this.data.append("AWSAccessKeyId", options.AWSAccessKeyId);
    this.data.append("acl", options.acl);
    this.data.append("policy", options.policy);
    this.data.append("signature", options.signature);
    this.data.append("Content-Type", options.contenttype || options["Content-Type"]);
    // Add a hidden file input which can be triggered to open a file dialog
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.style = 'display:none';
    input.id = 's3upload';
    document.body.appendChild(input);
    input.addEventListener('change', (e) => options.onChange(e));
    this.input = input;

    this.upload = this.upload.bind(this);
    this.open = this.open.bind(this);
  }

  upload() {
    this.data.append("file", this.file);
    const {key, bucket, success, error} = this.options;

    const req = new window.XMLHttpRequest();
    req.open("POST", `https://${bucket}.s3.amazonaws.com/`, true);
    req.onload = function(e) {
      if (req.status >= 200 && req.status < 400) {
        success(`https://${bucket}.s3.amazonaws.com/${key}`);
      } else {
        error(e);
      }
    };
    req.send(this.data);
  }

  open() {
    this.input.click();
  }

  onChange(e) {
    const file = e.target.files[0];
    // When there is no width and height given, don't scale the image
    const {width, height} = this.options;
    if (!width || !height) {
      this.file = file;
    } else {
      return this.resizeImage(file, width, height).then(file => {
        this.file = file;
        return file;
      });
    }
  }

  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onload = function(e) {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);

    });
  }

  resizeImage(file, width, height) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.style = 'display:none';
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      this.fileToDataUrl(file).then(src => {
        const image = new window.Image();
        image.onload = () => {
          const imageWidth = image.width;
          const imageHeight = image.height;
          let newWidth, newHeight;

          if (imageWidth > imageHeight) {
            newWidth = (height / imageHeight) * imageWidth;
            newHeight = height;
          } else {
            newHeight = (width / imageWidth) * imageHeight;
            newWidth = this.options.width;
          }

          ctx.drawImage(
            image,
            -(imageWidth - width) / 2,
            -(imageHeight - height) / 2,
            imageWidth,
            imageHeight
          );

          // Convert the canvas to dataurl and blobfile to be send
          // to the client using this module. So that it can be used
          // to upload it to a server for example
          const dataurl = canvas.toDataURL("image/png");
          const blobBin = window.atob(dataurl.split(',')[1]);
          const array = [];
          for (let i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
          }
          resolve(new window.Blob([new window.Uint8Array(array)], {type: 'image/png'}));
        };
        // Set the image object source, onload will be called afterwards
        image.src = src;
      });
    });
  }

  toDataUrl(src) {
    return new Promise((resolve, reject) => {
      const file = this.input.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });

  }

}
