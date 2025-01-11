import {faBomb, faComments, faLightbulb, faHeading, IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {faBug} from "@fortawesome/free-solid-svg-icons/faBug";
import {faClipboardCheck} from "@fortawesome/free-solid-svg-icons/faClipboardCheck";
import {faFolderOpen} from "@fortawesome/free-regular-svg-icons";

export interface formGroupBug {
  bugName: string;
  bugSteps: string;
  bugExpected: string;
  bugActual: string;
}

export interface CurrentStep {
  bug_report: number;
  idea_suggestion: number;
}

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
  type: 'text' | 'textarea' | 'select';
}

export const bug_steps: FormStep[] = [
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

export const idea_steps: FormStep[] = [
  {
    id: 1,
    title: 'FORM_IDEA_SUGGESTION_1_TITLE',
    fields: [{
      id: 'idea-title',
      label: 'FORM_IDEA_SUGGESTION_1_FIELD_1_TITLE',
      icon: faHeading,
      controlName: 'ideaTitle',
      type: 'text',
      placeholder: 'FORM_IDEA_SUGGESTION_1_FIELD_1_PLACEHOLDER'
    }]
  },
  {
    id: 2,
    title: 'FORM_IDEA_SUGGESTION_2_TITLE',
    fields: [
      {
        id: 'idea-description',
        label: 'FORM_IDEA_SUGGESTION_2_FIELD_1_TITLE',
        icon: faComments,
        controlName: 'ideaDescription',
        type: 'textarea',
        placeholder: 'FORM_IDEA_SUGGESTION_2_FIELD_1_PLACEHOLDER'
      }
    ]
  },
  {
    id: 3,
    title: 'FORM_IDEA_SUGGESTION_3_TITLE',
    fields: [
      {
        id: "idea-category",
        label: "FORM_IDEA_SUGGESTION_3_FIELD_1_TITLE",
        icon: faFolderOpen,
        controlName: "ideaCategory",
        type: "select",
        placeholder: "FORM_IDEA_SUGGESTION_3_FIELD_1_PLACEHOLDER"
      }
    ]
  }
];
