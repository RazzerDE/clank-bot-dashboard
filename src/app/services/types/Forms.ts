import {faBomb, faLightbulb, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faBug} from "@fortawesome/free-solid-svg-icons/faBug";
import {faClipboardCheck} from "@fortawesome/free-solid-svg-icons/faClipboardCheck";

export interface WizardStep {
  title: string;
  isEmpty: () => boolean;
}

export interface FormStep {
  id: number;
  title: string;
  fields: FormField[];
}

interface FormField {
  id: string;
  label: string;
  icon: IconDefinition;
  controlName: string;
  placeholder: string;
  type: 'text' | 'textarea';
}

export const steps: FormStep[] = [
  {
    id: 1,
    title: 'FORM_BUG_REPORT_1_TITLE',
    fields: [{
      id: 'bug-name',
      label: 'FORM_BUG_REPORT_1_FIELD_1_TITLE',
      icon: faBug,
      controlName: 'bugName',
      type: 'text',
      placeholder: 'FORM_BUG_REPORT_1_FIELD_1_PLACEHOLDER'
    }]
  },
  {
    id: 2,
    title: 'FORM_BUG_REPORT_2_TITLE',
    fields: [
      {
        id: 'bug-expected',
        label: 'FORM_BUG_REPORT_2_FIELD_1_TITLE',
        icon: faLightbulb,
        controlName: 'bugExpected',
        type: 'text',
        placeholder: 'FORM_BUG_REPORT_2_FIELD_1_PLACEHOLDER'
      },
      {
        id: 'bug-actual',
        label: 'FORM_BUG_REPORT_2_FIELD_2_TITLE',
        icon: faBomb,
        controlName: 'bugActual',
        type: 'text',
        placeholder: 'FORM_BUG_REPORT_2_FIELD_2_PLACEHOLDER'
      }
    ]
  },
  {
    id: 3,
    title: 'FORM_BUG_REPORT_3_TITLE',
    fields: [{
      id: 'bug-steps',
      label: 'FORM_BUG_REPORT_3_FIELD_1_TITLE',
      icon: faClipboardCheck,
      controlName: 'bugSteps',
      type: 'textarea',
      placeholder: 'FORM_BUG_REPORT_3_FIELD_1_PLACEHOLDER'
    }]
  }
];
