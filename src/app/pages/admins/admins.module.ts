import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsRoutingModule } from './admins-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StyleClassModule } from 'primeng/styleclass';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TableComponent } from './table/table.component';
import { AdminDialogComponent } from './components/admin-dialog/admin-dialog.component';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';

import { TreeSelectModule } from 'primeng/treeselect';
import { ImageModule } from 'primeng/image';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';


@NgModule({
	declarations: [
		TableComponent,
		AdminDialogComponent,
		DeleteDialogComponent
	],
	imports: [
		CommonModule,
		AdminsRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		TableModule,
		StyleClassModule,
		DividerModule,
		FileUploadModule,
		RatingModule,
		InputTextareaModule,
		ButtonModule,
		InputTextModule,
		ToggleButtonModule,
		TooltipModule,
		ToolbarModule,
		InputNumberModule,
		RippleModule,
		MultiSelectModule,
		SelectButtonModule,
		DropdownModule,
		AutoCompleteModule,
		ToastModule,
		DialogModule,
		MessagesModule,
		MessageModule,
		PasswordModule,
		InputMaskModule,
		TreeSelectModule,
		ImageModule,
		GalleriaModule,
		CarouselModule
	]
})
export class AdminsModule { }
