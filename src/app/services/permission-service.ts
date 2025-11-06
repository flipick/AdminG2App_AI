import { Injectable } from '@angular/core';
import { IPermission, IRole } from '../model/permission';
import { IPERMISSIONS } from './permissions.config';
import { getRoleName } from './utility';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  private currentRole: IRole = 'superadmin'; 

  getPermission(page: string): IPermission {
    this.currentRole = getRoleName().toLowerCase() as IRole;
    if(!this.currentRole || !IPERMISSIONS[this.currentRole]) {
      this.currentRole = 'superadmin'; 
    }
    return IPERMISSIONS[this.currentRole][page] || {};
  }

  hasPermission(page: string, key: keyof IPermission): boolean {
    return !!IPERMISSIONS[this.currentRole][page]?.[key];
  }

}
