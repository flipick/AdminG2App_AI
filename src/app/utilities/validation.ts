import { FormControl } from "@angular/forms";

export function requiredFileType(type: string) {
  return function (control: FormControl) {
    const file = control.value;
    var result = true;
    if (file) {
      const extension = file.name.split('.')[1].toLowerCase();
      var str_spl = type.split(',');
      for (var num = 0; num < str_spl.length; num++) {
        if (str_spl[num].toLowerCase() == extension.toLowerCase()) {
          result = false;
          break;
        }
      }
      if (result === true) {
        return {
          requiredFileType: true,
        };
      }
      return null;
    }
    return null;
  };
}