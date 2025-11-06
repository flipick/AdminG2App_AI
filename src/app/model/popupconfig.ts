import { FormGroup } from '@angular/forms';
export type PopupSize = 'small' | 'medium' | 'large' | 'fullWidth';
export type PopupAction = 'close' | 'custom' | 'submit';

export interface PopupButton {
  id?: string;            // optional identifier
  label: string;          // button text
  cssClass?: string;      // Tailwind classes
  action: PopupAction;    // 'close' auto-closes, 'custom' bubbles up
  emitEventName?: string; // for custom actions
  isVisible?: boolean;    // default true
  disabled?: boolean;     // optional disabled state
}

export class PopupConfig { 
  popupFunctionalityType?: string;
  isShowPopup: boolean = false;
  isShowHeaderText: boolean = true;
  isCrossIcon: boolean = true;
  popupFor: 'small' | 'medium' | 'large' | 'fullWidth' = 'small';
  headerText: string = '';
  buttons: PopupButton[] = [];
  formGroup?: FormGroup;
}

export class PopupConfigFactory {
  public static getPopupConfig(config: any) {      
    let pconf = new PopupConfig();
    Object.assign(pconf, config);    
    return pconf;
  }
}