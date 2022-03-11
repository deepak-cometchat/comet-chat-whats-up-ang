import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "group-list-item",
  templateUrl: "./group-list-item.component.html",
  styleUrls: ["./group-list-item.component.css"],
})
export class GroupListItemComponent implements OnInit {
  @Input() group = null;
  @Input() selectedGroup = null;

  @Output() onGroupClick: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  groupClicked(group) {
    try {
      this.onGroupClick.emit(group);
    } catch (error) {
      console.error(error);
    }
  }
}
