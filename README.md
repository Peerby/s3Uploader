# s3Uploader

Module to upload files from the browser to an AWS S3 bucket. Sorry, not much documentation yet.

## Example

```
// The image we are updating
var $img = $('html').find('img');

// Create the uploader
uploader = s3Uploader.create({
    bucket: aup.bucket,
    key: aup.filename,
    AWSAccessKeyId: aup.s3Key,
    acl: 'public-read',
    policy: aup.s3PolicyBase64,
    signature: aup.s3Signature,
    contenttype: 'image/jpeg',
    width: 500,
    height: 500,
    fileAdded: onFileAdded
});

$img.on('click', function (e) {
    e.stopImmediatePropagation();
    uploader.open();
});

function onFileAdded (file, src) {

    // Set the thumbnail directly to give the user feedback
    if (src) {
        $img.attr('src', src);
    } else {
        uploader.toDataUrl(function (src) {
            $img.attr('src', src);
        });
    }

    // Start uploading to AWS
    uploader.upload({
        success: function (url) {
            // Save url of uploaded image in database
            $.ajax({
                url: '/api/user/avatar',
                type: 'POST',
                data: { avatar: url },
                success: function () {
                    // Yay, done
                },
                error: function () {
                    // Error on own server
                }
            });
        },
        error: function () {
            // Uploader encountered an error
        }
    });

}
```
