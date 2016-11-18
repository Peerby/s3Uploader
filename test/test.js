import S3Uploader from '../src/uploader';
import expect from 'expect';
import Canvas from 'canvas';

const DATA_URL_5x5_RED = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAEklEQVR42mP8z8AARKiAkQaCAFxlCfyG/gCwAAAAAElFTkSuQmCC';
const DATA_URL_2x2_RED = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8AARAwMjDAGACwBA/9IB8FMAAAAAElFTkSuQmCC';

describe('S3Uploader', function () {

  it('should append input element on init to DOM', function(done) {
    new S3Uploader({
      key: '',
      AWSAccessKeyId: '',
      acl: '',
      policy: '',
      signature:'',
      'Content-Type': '',
    });
    const input = document.getElementById('s3upload');
    expect(input).toExist();
    done();
  });

  it('should upload', function(done) {
    const s3 = new S3Uploader({
      key: '',
      AWSAccessKeyId: '',
      bucket: 'test',
      acl: '',
      policy: '',
      signature:'',
      'Content-Type': '',
    });

    const input = document.getElementById('s3upload');
    const f = new File([''], 'filename');
    input.file = f;

    const openSpy = expect.spyOn(global.window.XMLHttpRequest.prototype, 'open');
    const sendSpy = expect.spyOn(global.window.XMLHttpRequest.prototype, 'send');

    s3.upload();

    expect(openSpy).toHaveBeenCalledWith('POST', 'https://test.s3.amazonaws.com/', true);
    expect(sendSpy).toHaveBeenCalledWith(s3.data);

    done();
  });

  it('should resize', function(done) {
    const s3 = new S3Uploader({
      width: 2,
      height: 2,
      key: '',
      AWSAccessKeyId: '',
      bucket: 'test',
      acl: '',
      policy: '',
      signature:'',
      'Content-Type': '',
    });

    const input = document.getElementById('s3upload');

    // force loading of simple png, 5x5 red png
    const spy = expect.spyOn(s3, 'fileToDataUrl').andReturn(new Promise(resolve => {
      resolve(DATA_URL_5x5_RED);
    }));
    // override Image implementation with:
    // https://github.com/Automattic/node-canvas/blob/master/lib/image.js
    window.Image = Canvas.Image;
    // trigger onChange, with dummy file
    const promise = s3.onChange({ target: { files: [new File(['asdf'], 'filename')] } });

    // image should be resized
    promise.then(blob => {
      const fr = new window.FileReader();
      fr.onload = e => {
        // result should be 2x2 red pixels
        expect(e.target.result !== DATA_URL_2x2_RED);
        done();
      };
      fr.readAsDataURL(blob);
    }).catch((err) => {
        done(err);
    });
  });

});
