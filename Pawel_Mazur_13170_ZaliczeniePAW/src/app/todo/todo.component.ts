import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ITaskWithSubtasks } from '../models/task';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {

  todoForm!: FormGroup;
  subtasksFormArray!: FormArray;
  tasks: ITaskWithSubtasks[] = [];
  inprogress: ITaskWithSubtasks[] = [];
  done: ITaskWithSubtasks[] = [];
  updateIndex: any;
  isEditEnabled: boolean = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      item: ['', Validators.required],
      subtasks: this.fb.array([])
    });
    this.subtasksFormArray = this.todoForm.get('subtasks') as FormArray;
    
    // Load tasks, inprogress, and done from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
    const savedInProgress = localStorage.getItem('inprogress');
    if (savedInProgress) {
      this.inprogress = JSON.parse(savedInProgress);
    }
    const savedDone = localStorage.getItem('done');
    if (savedDone) {
      this.done = JSON.parse(savedDone);
    }
  }

  saveTasksToLocalStorage() {
    const tasksString = JSON.stringify(this.tasks);
    localStorage.setItem('tasks', tasksString);
  }

  saveInProgressToLocalStorage() {
    const inProgressString = JSON.stringify(this.inprogress);
    localStorage.setItem('inprogress', inProgressString);
  }

  saveDoneToLocalStorage() {
    const doneString = JSON.stringify(this.done);
    localStorage.setItem('done', doneString);
  }

  addTask() {
    const task: ITaskWithSubtasks = {
      description: this.todoForm.value.item,
      done: false,
      subtasks: this.todoForm.value.subtasks 
    };
    this.tasks.push(task);
    this.saveTasksToLocalStorage();
    this.todoForm.reset();
    this.subtasksFormArray.clear(); 
  }

  onEdit(item: ITaskWithSubtasks, i: number) {
    this.todoForm.controls['item'].setValue(item.description);
    this.subtasksFormArray.clear(); 
    item.subtasks.forEach((subtask: string) => {
      this.subtasksFormArray.push(this.fb.control(subtask)); 
    });
    this.updateIndex = i;
    this.isEditEnabled = true;
  }

  updateTask() {
    this.tasks[this.updateIndex].description = this.todoForm.value.item;
    this.tasks[this.updateIndex].done = false;
    this.tasks[this.updateIndex].subtasks = this.todoForm.value.subtasks; 
    this.saveTasksToLocalStorage();
    this.todoForm.reset();
    this.subtasksFormArray.clear();
    this.updateIndex = undefined;
    this.isEditEnabled = false;
  }

  deleteTask(i: number) {
    this.tasks.splice(i, 1);
    this.saveTasksToLocalStorage();
  }

  deleteInProgressTask(i: number) {
    this.inprogress.splice(i, 1);
    this.saveInProgressToLocalStorage();
  }

  deleteDoneTask(i: number) {
    this.done.splice(i, 1);
    this.saveDoneToLocalStorage();
  }

  drop(event: CdkDragDrop<ITaskWithSubtasks[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.saveTasksToLocalStorage();
    this.saveInProgressToLocalStorage();
    this.saveDoneToLocalStorage();
  }

  addSubtask() {
    this.subtasksFormArray.push(this.fb.control(''));
  }

  deleteSubtask(index: number) {
    this.subtasksFormArray.removeAt(index);
  }

}