import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, FormControl, ValidationErrors, Form } from '@angular/forms';
import { debounceTime, distinctUntilChanged, pairwise } from 'rxjs/operators';

export interface ServerError {
  [key: string]: [];
}

@Injectable({
  providedIn: 'root'
})
export class ErrorhandleService {

  private form: FormGroup;
  private errorObject: any;
  private message: string;

  constructor() { }

  /**
   * a helper function to validate if a control needs to display error message
   * @param {AbtractControl} control - The control to valid
   * @returns boolean
   */
  private static hasError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  /**
   *
   * @param formGroup
   * @param error
   */
  handleError(formGroup: FormGroup, error: any) {
    this.form = formGroup;
    this.errorObject = error;
    this.form.valueChanges.pipe(
      debounceTime(500),
      // this operator will use '===' to compare the values, if it's the same it will not emit.
      distinctUntilChanged(),
      // emits the previous form state and the current form state.
      pairwise()
    ).subscribe((form) => {
      console.log(form);
      // compare the previous and the current form to see which fields have been modified.
      let diffs = this.compareFormGroups(form[0], form[1]);
      this.findErrors(formGroup.controls, diffs);
    })
  }
  /**
   * This helper method is to find out the modified fields between the previous and the current formGroup.
   * currently not dealing with formArray
   * @param prev previous key/value pair of the formGroup
   * @param curr curent key/value pair of the formGroup
   * @returns
   */
  private compareFormGroups(prev: any[], curr: any[]): string[] {
    let diffs = [];
    Object.keys(prev).forEach((key) => {
      if (prev[key] !== curr[key]) {
        diffs.push(key);
      }
    })
    return diffs;
  }

  /**
   * Extract the modified form fields and call the findErrorsOnFormControl or findErrorsOnFormArray to find the errors.
   * @param controls
   * @param diffs
   */
  findErrors(controls: {[key: string]: AbstractControl}, diffs: string[]): void {
    Object.keys(controls)
    // only need to check the modified fields.
    .filter((control: string) => {
      let found = diffs.indexOf(control);
      return found !== -1;
    })
    .forEach((control: string) => {
      console.log(control);
      if (controls[control] instanceof FormArray) {
        Object.defineProperty(this.errorObject, control, {value: [], writable: true});
        this.findErrorsOnFormArray(controls[control] as FormArray, control);
      } else if (controls[control] instanceof FormControl) {
        this.findErrorsOnFormControls(controls, control);
      }
    })
  }

  /**
   * find the errors in a FormArray
   * @param formArray
   * @param formArrayName
   */
  private findErrorsOnFormArray(formArray: FormArray, formArrayName: string) {
    let i = 0;
    for (const formGroup of formArray.controls as FormGroup[]) {
      const controls = formGroup.controls;
      const formArrayErrors: any[] = this.errorObject[formArrayName];
      formArrayErrors.push({});
      Object.keys(controls).forEach((control: string) => {
        if (ErrorhandleService.hasError(controls[control])) {
          this.setErrorMessage(controls[control].errors);
          Object.defineProperty(formArrayErrors[i], control, {value: this.message, writable: true});
        }
      })
      i++;
    }
  }

  /**
   * find the errors in a FormControl
   * @param controls
   * @param control
   */
  private findErrorsOnFormControls(controls: {[key: string]: AbstractControl}, control: string): void {
    if (ErrorhandleService.hasError(controls[control])) {
      this.setErrorMessage(controls[control].errors);
      this.setErrorToErrorObject(control);
    }
  }

  /**
   * According to the error parameters, choose the appropriate error message set to the message property in this class.
   * @param error
   */
  private setErrorMessage(error: ValidationErrors): void {
    if (error.email) {
      this.message = "email required";
    } else if (error.required) {
      this.message = "this field is required";
    } else if (error.minlength) {
      this.message = `please input a value longer than ${error.minlength.requiredLength}, you only input ${error.minlength.actualLength}`
    }
  }

  /**
   * set a property to the error object , which the key is the control name and the value is the message property inside the class.
   * @param control
   */
  private setErrorToErrorObject(control: string): void {
    Object.defineProperty(this.errorObject, control, {value: this.message, writable: true});
  }
}
