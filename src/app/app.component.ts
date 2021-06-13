import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators, FormArray } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ErrorhandleService } from './errorhandle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Centralized-Form-ErrorHandler';
  public formGroup: FormGroup;
  error: any = {};

  constructor(private fb: FormBuilder, private errorHandler: ErrorhandleService) {}

  ngOnInit() {
    this.formGroup = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(5)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      ssn: ['', [Validators.required]],
      email: new FormControl('', [Validators.email]),
      favoriteFoods: this.fb.array([
        this.fb.group({
          foodCal: ['', [Validators.required]],
          foodName: ['', [Validators.required]]
        }),
        this.fb.group({
          foodCal: ['', [Validators.required]],
          foodName: ['', [Validators.required]]
        })
      ])
    });
    this.errorHandler.handleError(this.formGroup, this.error);
    this.formGroup.patchValue({});
  }

  onSubmit() {
    console.log(this.formGroup);
    console.log(this.error);
  }

  get favoriteFoods() {
    return this.formGroup.get("favoriteFoods") as FormArray;
  }
}
