import { type ReactNode } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, HelpOutline as HelpIcon } from '@mui/icons-material';

interface QA {
  q: string;
  a: ReactNode;
}

interface Section {
  title: string;
  items: QA[];
}

const SECTIONS: Section[] = [
  {
    title: 'Dáta a súkromie',
    items: [
      {
        q: 'Kde sa ukladajú moje dáta?',
        a: 'Tvoje profily zvierat a zdravotné záznamy sa ukladajú v zabezpečenej cloudovej databáze (Supabase) cez náš server. Sú viazané na tvoj účet — nie sú uložené len v prehliadači.',
      },
      {
        q: 'Kto vidí moje záznamy?',
        a: 'Iba ty. Každá požiadavka je zviazaná s tvojím prihláseným účtom a databáza je nastavená tak, že bez tvojho prihlásenia sa k dátam nikto nedostane.',
      },
      {
        q: 'Dostanem sa k dátam z viacerých zariadení?',
        a: 'Áno. Keďže dáta sú v cloude, po prihlásení ich uvidíš na mobile, tablete aj počítači — vždy aktuálne.',
      },
      {
        q: 'Sú moje dáta v bezpečí?',
        a: 'Komunikácia prebieha cez šifrované HTTPS spojenie, prístup k dátam je možný len po prihlásení a tajné kľúče k databáze sú výhradne na serveri, nikdy nie v prehliadači.',
      },
    ],
  },
  {
    title: 'Fotky a AI',
    items: [
      {
        q: 'Ukladajú sa skeny a fotky, ktoré nahrám na rozpoznanie?',
        a: 'Nie. Keď nahráš fotku pasu alebo obalu krmiva na AI rozpoznanie, použije sa len na prečítanie textu — výsledok (napr. vakcinácie alebo hodnotenie) dostaneš späť, ale samotný obrázok sa na server neukladá.',
      },
      {
        q: 'A fotky, ktoré priložím priamo k záznamu alebo epizóde?',
        a: 'Tie áno — prílohy, ktoré vedome pridáš k záznamu (napr. k epizóde alebo vakcinácii), sa uložia ako jeho súčasť, aby si ich videl aj neskôr.',
      },
      {
        q: 'Ako funguje AI analýza?',
        a: 'Text alebo fotku spracujú AI služby (OpenAI a Google Vision), ktoré rozpoznajú obsah a vrátia výsledok. Posielame len to, čo je potrebné na vyhodnotenie.',
      },
      {
        q: 'Je výsledok analýzy lekárska rada?',
        a: 'Nie. Pawport je pomocník a evidencia — uľahčuje prehľad a rozhodovanie, ale nenahrádza veterinára. Pri zdravotných problémoch sa vždy poraď s odborníkom.',
      },
    ],
  },
  {
    title: 'Účet a používanie',
    items: [
      {
        q: 'Ako sa prihlásim?',
        a: 'Cez e-mail a heslo, alebo jedným klikom cez Google účet.',
      },
      {
        q: 'Zabudol som heslo, čo teraz?',
        a: 'Na prihlasovacej stránke klikni na „Zabudnuté heslo?" a pošleme ti e-mail na nastavenie nového hesla.',
      },
      {
        q: 'Môžem mať viac zvierat?',
        a: 'Áno. Vytvor si profil pre každé zviera — psy, mačky aj ďalšie domáce zvieratá, každé so svojimi alergiami a záznamami.',
      },
      {
        q: 'Čo sa stane, keď zmažem zviera?',
        a: 'Spolu s profilom sa zmažú aj všetky jeho súvisiace záznamy (vakcinácie, lieky, epizódy, výdavky…). Túto akciu nie je možné vrátiť.',
      },
      {
        q: 'Ako zmažem účet a všetky svoje dáta?',
        a: 'V bočnom menu klikni na „Zmazať účet". Natrvalo sa odstráni tvoj účet aj všetky uložené dáta. Akcia je nevratná.',
      },
      {
        q: 'Funguje to na mobile?',
        a: 'Áno, aplikácia je plne responzívna a v prehliadači si ju vieš pridať na domovskú obrazovku ako appku.',
      },
      {
        q: 'Koľko to stojí?',
        a: 'Pawport je momentálne zadarmo.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
        <HelpIcon color="primary" />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Časté otázky
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Stručné odpovede na to, ako Pawport funguje a čo sa deje s tvojimi dátami.
      </Typography>

      {SECTIONS.map((section) => (
        <Box key={section.title} sx={{ mb: 3 }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 1, px: 0.5 }}
          >
            {section.title}
          </Typography>
          <Stack spacing={1}>
            {section.items.map((item) => (
              <Accordion
                key={item.q}
                disableGutters
                sx={{
                  borderRadius: '12px !important',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
