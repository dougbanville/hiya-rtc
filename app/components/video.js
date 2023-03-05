import Component from '@glimmer/component';
import RecordRTC, { captureCamera, RecordRTCPromisesHandler } from 'recordrtc';
import { modifier } from 'ember-modifier';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class VideoComponent extends Component {
  @tracked video;
  @tracked recorder;
  videoRecorder = modifier(
    async () => {
      this.video = document.getElementById('hiya-video');
    },
    { eager: false }
  );

  captureCamera = (callback) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(function (camera) {
        callback(camera);
      })
      .catch(function (error) {
        alert('Unable to capture your camera. Please check console logs.');
        console.error(error);
      });
  };

  @action
  startCamera() {
    if (this.video) {
      this.captureCamera((camera) => {
        this.video.muted = true;
        this.video.volume = 0;
        this.video.srcObject = camera;

        this.recorder = RecordRTC(camera, {
          type: 'video',
          mimeType: 'video/webm',
        });

        // release camera on stopRecording
        this.recorder.camera = camera;

        //document.getElementById('btn-stop-recording').disabled = false;
      });
    }
  }

  @action
  async startRecording() {
    this.recorder.startRecording();
  }

  @action
  stopRecording() {
    this.recorder.stopRecording(() => {
      this.video.src = this.video.srcObject = null;
      this.video.muted = false;
      this.video.volume = 1;
      this.video.src = URL.createObjectURL(this.recorder.getBlob());
      console.log(this.video.src);

      this.recorder.camera.stop();
      this.recorder.destroy();
      this.recorder = null;
    });
  }
}

// TODO - Save it to the server
// Make it so user is logged it and can save the Blob
// to firebase or something
// https://balinterdi.com/blog/image-uploads-to-s3-in-ember-js-part-1/
