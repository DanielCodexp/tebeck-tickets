import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor() { }

  async shootSimpleAlert(icon: SweetAlertIcon, title: string, text?: string) : Promise<void> {
    await Swal.fire({
      position: 'center',
      icon: icon,
      title: title,
      text: text,
      showConfirmButton: true,
      confirmButtonColor: '#84CE6A',
      confirmButtonText: 'Aceptar',
    });
  }

  async shootSimpleAlertNotOutsideClick(icon: SweetAlertIcon, title: string, text?: string) : Promise<void> {
    await Swal.fire({
      position: 'center',
      icon: icon,
      title: title,
      text: text,
      allowOutsideClick: false,
      showConfirmButton: true,
      confirmButtonColor: '#84CE6A',
      confirmButtonText: 'Aceptar',
    });
  }

  async shootConfirmAlert(icon: SweetAlertIcon, title: string, text?: string)  {
    return await Swal.fire({
      position: 'center',
      icon: icon,
      title: title,
      text: text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: "#84CE6A",
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    });
  }

  async shootConfirmAlertOkButton(icon: SweetAlertIcon, title: string, text?: string) {
    return await Swal.fire({
      position: 'center',
      icon: icon,
      title: title,
      text: text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: "#84CE6A",
      showCancelButton: false,
    });
  }

  async toastAlert(icon: SweetAlertIcon, title: string){
    const Toast = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      icon: icon,
    });

    Toast.fire({
      icon: icon,
      title: title,
    });
  }

  async shootLoadingAlert() {
    await Swal.fire({
      title: 'Espere un momento...',
      html: 'Cargando',
      timerProgressBar: true,
      backdrop: false,
      didOpen: () => {
        Swal.showLoading()
      },
      
    })
  }
}
