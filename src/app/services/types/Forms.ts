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
    title: '› In diesem Schritt sammeln wir allgemeine Informationen über deinen Fehler, damit das Entwicklungs-Team weiß worum es konkret geht. 🤔',
    fields: [{
      id: 'bug-name',
      label: '✏️ Beschreibe das Problem kurz',
      icon: faBug,
      controlName: 'bugName',
      type: 'text',
      placeholder: 'Beschreibe das Problem in einem Satz - Vermeide Sätze wie "es ist kaputt" oder "das glitcht".'
    }]
  },
  {
    id: 2,
    title: '› In diesem Schritt versuchen wir besser zu verstehen, wieso dies ein Fehler ist. 💡',
    fields: [
      {
        id: 'bug-expected',
        label: '✅ Erwartetes Ergebnis',
        icon: faLightbulb,
        controlName: 'bugExpected',
        type: 'text',
        placeholder: 'Der Slashbefehl sollte antworten mit einem Dropdown & Embed.'
      },
      {
        id: 'bug-actual',
        label: '❌ Aktuelles Ergebnis',
        icon: faBomb,
        controlName: 'bugActual',
        type: 'text',
        placeholder: 'Der Slashbefehl schlägt fehl mit dem Fehler "Interaction failed".'
      }
    ]
  },
  {
    id: 3,
    title: '› Wie hast du den Bug erzeugt? Das hilft uns, ihn leichter nachzuvollziehen. 📝',
    fields: [{
      id: 'bug-steps',
      label: '🐞 Schritte, um Fehler zu erzeugen',
      icon: faClipboardCheck,
      controlName: 'bugSteps',
      type: 'textarea',
      placeholder: '1. Besuche discord.gg/bl4cklist Discord-Server\\n2. Verwende /help von dem Clank-Bot\\n3. Die Antwort vom Bot wird fehlschlagen.'
    }]
  }
];
