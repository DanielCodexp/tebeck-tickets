import { Injectable } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private _workbook!: Workbook;
  constructor() { }

  async downloadContactsExcel(dataExcel: any) {
    console.log(dataExcel);
    // return
    this._workbook = new Workbook();
    this._workbook.creator = 'Menonita';
    await this.reportProspect(dataExcel);
    let buffer = await this._workbook.xlsx.writeBuffer().then((data: BlobPart) => {
      const blob = new Blob([data]);
      fs.saveAs(blob, `contactos.xlsx`);
    });
  }

  async reportProspect(dataExcel: any) {
    try {
      const sheet = this._workbook.addWorksheet(`Lista de contactos`);
      let letters: string[] = [
        'A',
        'B',
        'C',
        'D',
        'E',
      ];

      for (let index = 0; index < letters.length; index++) {
        const letter = letters[index];
        sheet.getColumn(letter).width = 40;
      }
      const headerRow = sheet.getRow(1);
      headerRow.values = ['Nombre', 'Teléfono', 'Tienda', 'Producto', 'Fecha'];
      for (let index = 0; index < 5; index++) {
        let letter = (letters[index] + '1') as string;
        let rows = sheet.getCell(letter);
        rows.style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '00293a' },
          },
          font: { bold: true, size: 15, color: { argb: 'ffffff' } },
          alignment: { horizontal: 'center' },
        };
      };
      // const idImg = await this._getIdImage('https://firebasestorage.googleapis.com/v0/b/sonora-global.appspot.com/o/sonora-logo-webp.png?alt=media&token=84751174-2a51-41be-b5a3-ed6ad4f97c63');
      // sheet.addImage(idImg, {
      //   tl: { col: 1, row: 0 },
      //   ext: { width: 155, height: 80 },
      // });

      const rowToInsert = sheet.getRows(2, dataExcel!.length);
      for (let index = 0; index < rowToInsert!.length; index++) {
        const row = rowToInsert![index];
        const itemData = dataExcel![index];
        row.values = [
          itemData.contactName,
          itemData.contactPhoneNumber,
          itemData.store.name,
          itemData.product.name,
          this.parseDate(itemData.date),
          // itemData.status,
        ];
        row.font = { size: 12 };
        row.alignment = { horizontal: 'center' };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  parseDate(date: string) {
    let createDate = new Date(date)
    const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DIC"];
    return `${createDate.getDate()}-${months[createDate.getMonth()]}-${createDate.getFullYear()}`;
  }

  private async _getIdImage(url: string): Promise<number> {
    const response = await fetch(url);
    const img = this._workbook.addImage({
      buffer: await response.arrayBuffer(),
      extension: 'jpeg',
    });
    return img;
  }

  async downloadStoreExcel(dataExcel: any) {
    console.log(dataExcel);
    // return
    this._workbook = new Workbook();
    this._workbook.creator = 'Menonita';
    await this.storeProspect(dataExcel);
    let buffer = await this._workbook.xlsx.writeBuffer().then((data: BlobPart) => {
      const blob = new Blob([data]);
      fs.saveAs(blob, `tiendas.xlsx`);
    });
  }

  async storeProspect(dataExcel: any) {
    try {
      const sheet = this._workbook.addWorksheet(`Lista de tiendas`);
      let letters: string[] = [
        'A',
        'B',
      ];

      for (let index = 0; index < letters.length; index++) {
        const letter = letters[index];
        sheet.getColumn(letter).width = 40;
      }
      const headerRow = sheet.getRow(1);
      headerRow.values = ['Nombre', 'Cantidad de contactos'];
      for (let index = 0; index < 2; index++) {
        let letter = (letters[index] + '1') as string;
        let rows = sheet.getCell(letter);
        rows.style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '00293a' },
          },
          font: { bold: true, size: 15, color: { argb: 'ffffff' } },
          alignment: { horizontal: 'center' },
        };
      };
      // const idImg = await this._getIdImage('https://firebasestorage.googleapis.com/v0/b/sonora-global.appspot.com/o/sonora-logo-webp.png?alt=media&token=84751174-2a51-41be-b5a3-ed6ad4f97c63');
      // sheet.addImage(idImg, {
      //   tl: { col: 1, row: 0 },
      //   ext: { width: 155, height: 80 },
      // });

      const rowToInsert = sheet.getRows(2, dataExcel!.length);
      for (let index = 0; index < rowToInsert!.length; index++) {
        const row = rowToInsert![index];
        const itemData = dataExcel![index];
        row.values = [
          itemData.name,
          itemData.count,
        ];
        row.font = { size: 12 };
        row.alignment = { horizontal: 'center' };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
