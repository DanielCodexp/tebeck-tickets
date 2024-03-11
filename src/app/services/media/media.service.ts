import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertsService } from '../alerts/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(
    private storage: AngularFireStorage,
    ) { }

  /*
  * Upload Banners Functions
  */
  async createList(images: any[], uid: string, route: string): Promise<any[]> {
    try {
      let imagesList: any[] = [];      
      await Promise.all(
        images.map(async (image: any) => {
          let obj = await this.uploadImg(image, uid, route)
          imagesList.push(obj)
          return
        })
      );
      return imagesList;
    } catch (error) {
      throw error;
    }
  }
  public uploadImg(file: File, uid: string, route: string) {
    return new Promise<any>((resolve, reject) => {
      let id = Math.random().toString(36).substring(2);
      const filePath = `${route}/${uid}/${id}.${this.getImageType(file.type)}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file).then(res => {
        let downloadURL = fileRef.getDownloadURL();
        downloadURL.subscribe(url => {
          let data = url
          resolve(data)
        })
      })
    })
  }

  getImageType(imageType: string) {
    var type: string = '';
    console.log(imageType);
    switch (imageType) {
      case 'image/jpeg':
        type = 'jpeg';
        break;
      case 'image/png':
        type = 'png';
        break;
      case 'image/webp':
        type = 'webp';
        break;
      case 'application/pdf':
        type = 'pdf'
        break;
      default:
        type = 'jpg'
        break;
    }
    return type;
  }
  urlToBase64(url: string, name: string): File | unknown {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');
        canvas.height = img.height;
        canvas.width = img.width;
        ctx!.drawImage(img, 0, 0);
        var imgB = canvas.toDataURL()
        const imagemAsFile = new File([this.dataURItoBlob(imgB)], name, { type: 'image/jpeg' });
        resolve(imagemAsFile)
      };
      img.onerror = error => reject(error);
    })
  }
  dataURItoBlob(dataURI: any) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }
  public async removeImages(images: any[]) {
    try {
      await Promise.all(
        images.map(async img => {
          await this.storage.ref(img.ref).delete();
        })
      )
      return
    } catch (error) {
      console.error(error)
    }
  }

  async removeFolderStorage(id:string) {
    try {
      console.log(id);
      
      const removeFolder = await this.storage.ref(id);
      console.log(removeFolder);
      
      const listImages = await removeFolder.listAll().toPromise();
      console.log(listImages);
      
      console.log(listImages?.items);
      listImages?.items.forEach( async (image:any) => {
        await image.delete().toPromise()
      });
      // await removeFolder.delete().toPromise()
      return
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

}
