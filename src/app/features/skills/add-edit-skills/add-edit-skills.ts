import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-skills',
  imports: [],
  templateUrl: './add-edit-skills.html',
  styleUrl: './add-edit-skills.css'
})
export class AddEditSkills {
  constructor(private router: Router) {}

  goBackToList(): void {
    this.router.navigate(['skills']);
  }
}
