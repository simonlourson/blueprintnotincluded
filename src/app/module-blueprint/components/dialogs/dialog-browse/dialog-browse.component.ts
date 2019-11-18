import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-browse',
  templateUrl: './dialog-browse.component.html',
  styleUrls: ['./dialog-browse.component.css']
})
export class DialogBrowseComponent implements OnInit {

  visible: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  showDialog()
  {
    this.visible = true;
  }

}
