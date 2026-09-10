import "./components/list.scss";
import "./lists-demo.scss";
import { initListChecklist } from "./components/list";

const checklist = document.querySelector<HTMLElement>("#submission-checklist")!;
initListChecklist(checklist);
