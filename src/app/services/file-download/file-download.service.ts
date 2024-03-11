import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface FileHelper{
  url: string;
  extension: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {


  constructor(
    private http: HttpClient
  ) { }

  async downloadUrlsAndCompressPDFs(identifier: string, files: FileHelper[]): Promise<boolean> {
    try {
      const zip = new JSZip();

      let downloadPromises = [];

      for await (const file of files) {
        // const corsUrl = 'https://corsproxy.io/?' + encodeURIComponent(file.url);

        var response = await lastValueFrom(this.http.get(file.url, { responseType: 'blob' }));
        if (response) {
          downloadPromises.push(zip.file(identifier + file.extension, response));
        }

      }

      await Promise.all(downloadPromises)
        .then(() => {
          // Generar el archivo comprimido
          zip.generateAsync({ type: 'blob' })
            .then((content) => {
              // Guardar el archivo comprimido en el navegador
              saveAs(content, identifier+'.zip');
            });
        });

      return true;
    } catch (error) {
      return false;
    }
  }
}
