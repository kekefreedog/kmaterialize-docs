import "./lists-demo.scss";
import { initListChecklist } from 'kmaterialize';

const checklist = document.querySelector<HTMLElement>("#submission-checklist")!;
initListChecklist(checklist);
