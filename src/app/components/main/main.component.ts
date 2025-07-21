import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { ScreenData } from '../../../types/screenData.type';

// declaração de interface do electron
declare global {
  interface Window {
    electron: {
      capturePage: (rect: {
        x: number;
        y: number;
        width: number;
        height: number;
      }) => Promise<string>;
      onTriggerCapture: (callback: (event: Event, data: ScreenData) => void) => void;
      sendCaptureResponse: (response: {
        fileName: string;
        imgData: string;
        error?: string;
      }) => void;
    };
  }
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {

  constructor(private zone: NgZone) {}

  ngOnInit() {
    this.screenData();
  }

  private screenData() {
    window.electron.onTriggerCapture((_event: Event) =>
      this.setScreenData()
    );
  }

  private setScreenData() {
    this.captureIframe();
  }

  async captureIframe() {
    try {
      const iframe = document.getElementById('iframe');
      if (!iframe) {
        throw new Error('Iframe não encontrado');
      }
      const recort = { x: 0, y: 0, width: 1024, height: 768 };
      const imgData = await window.electron.capturePage(recort);
      const fileName = `${Date.now()}.png`;
      window.electron.sendCaptureResponse({ fileName, imgData });
    } catch (err: any) {
      window.electron.sendCaptureResponse({
        fileName: '',
        imgData: '',
        error: err.message,
      });
    }
  }
}
