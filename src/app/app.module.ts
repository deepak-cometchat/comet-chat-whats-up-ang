import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './shared/material.module';
import { AppComponent } from './app.component';
import { DefaultComponent } from './components/layouts/default/default.component';
import { BlankComponent } from './components/layouts/blank/blank.component';
import { WelcomeComponent } from './components/pages/welcome/welcome.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { StartComponent } from './components/pages/start/start.component';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './services/auth/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from "ngx-spinner";
import { ChatAreaComponent } from './components/layouts/chat-area/chat-area.component';
import { ChatDefaultPageComponent } from './components/layouts/chat-area/chat-default-page/chat-default-page.component';
import { SidebarComponent } from './components/layouts/sidebar/sidebar.component';
import { ChatListComponent } from './components/layouts/list-and-details/chat-list/chat-list.component';
import { ChatListItemComponent } from './components/layouts/list-and-details/chat-list-item/chat-list-item.component';
import { GroupListComponent } from './components/layouts/list-and-details/group-list/group-list.component';
import { GroupListItemComponent } from './components/layouts/list-and-details/group-list-item/group-list-item.component';
import { ContactListComponent } from './components/layouts/list-and-details/contact-list/contact-list.component';
import { UserProfileComponent } from './components/layouts/list-and-details/user-profile/user-profile.component';
import { ChatActionMessageComponent } from './components/layouts/chat-area/chat-action-message/chat-action-message.component';
import { ChatMessageInputareaComponent } from './components/layouts/chat-area/chat-message-inputarea/chat-message-inputarea.component';
import { ChatMessageHeaderComponent } from './components/layouts/chat-area/chat-message-header/chat-message-header.component';
import { ChatMessageListComponent } from './components/layouts/chat-area/chat-message-list/chat-message-list.component';
import { ChatReadReceiptComponent } from './components/layouts/chat-area/chat-read-receipt/chat-read-receipt.component';
import { ChatReceiverTextMessageComponent } from './components/layouts/chat-area/chat-receiver-text-message/chat-receiver-text-message.component';
import { ChatSenderTextMessageComponent } from './components/layouts/chat-area/chat-sender-text-message/chat-sender-text-message.component';
import { ChatIncomingCallComponent } from './components/layouts/chat-area/chat-incoming-call/chat-incoming-call.component';
import { ChatOutgoingCallComponent } from './components/layouts/chat-area/chat-outgoing-call/chat-outgoing-call.component';

import { AvatarModule } from 'ngx-avatar';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    DefaultComponent,
    BlankComponent,
    WelcomeComponent,
    LoginComponent,
    RegisterComponent,
    StartComponent,
    ChatAreaComponent,
    ChatDefaultPageComponent,
    SidebarComponent,
    ChatListComponent,
    ChatListItemComponent,
    GroupListComponent,
    GroupListItemComponent,
    ContactListComponent,
    UserProfileComponent,
    ChatActionMessageComponent,
    ChatMessageInputareaComponent,
    ChatMessageHeaderComponent,
    ChatMessageListComponent,
    ChatReadReceiptComponent,
    ChatReceiverTextMessageComponent,
    ChatSenderTextMessageComponent,
    ChatIncomingCallComponent,
    ChatOutgoingCallComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MaterialModule,
    AvatarModule,
  ],
  providers: [
    AuthGuard,
    AuthService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
