import type { FormData } from './types';

export interface RiskQuestion {
  id: string;
  question: string;
  options: Array<{
    value: string;
    title: string;
    description: string;
    riskScore: number; // 0-100, höher = risikofreudiger
  }>;
  category: 'loss_aversion' | 'regret_aversion' | 'time_horizon' | 'volatility' | 'opportunity' | 'emergency';
}

/**
 * Generiert personalisierte Risikofragen basierend auf dem Benutzerprofil
 */
export function generateRiskQuestions(data: Pick<FormData, 'step1' | 'step2' | 'step3' | 'step4'>): RiskQuestion[] {
  const questions: RiskQuestion[] = [];
  
  const income = parseFloat(data.step2.income) || 0;
  const expenses = parseFloat(data.step2.expenses) || 0;
  const assets = parseFloat(data.step2.assets) || 0;
  const liabilities = parseFloat(data.step2.liabilities) || 0;
  
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  const netWorth = assets - liabilities;
  const hasStressFeeling = data.step3.moneyFeelings.includes("Stress");
  const hasComplexityFeeling = data.step3.moneyFeelings.includes("Kompliziert");
  const isSecurityOriented = data.step3.lifestyleVsSecurity > 60;
  const hasLowKnowledge = data.step3.financialKnowledge < 40;
  const isExperienced = data.step3.investmentExperience === "Fortgeschritten" || data.step3.investmentExperience === "Experte";
  
  // 1. PFLICHTFRAGE: Verlust-Aversion (immer dabei)
  questions.push(getLossAversionQuestion(netWorth));
  
  // 2. Bei Investment-Erfahrung: Reue-Vermeidung
  if (data.step3.investmentExperience !== 'Keine') {
    questions.push(getRegretAversionQuestion(isExperienced));
  }
  
  // 3. Zeithorizont-Frage (wichtig für langfristige Ziele)
  const hasLongTermGoals = data.step1.goals.retirement || 
    (data.step1.goals.wealth && data.step1.goalDetails.wealth.horizon === "20+ Jahre");
  
  if (hasLongTermGoals) {
    questions.push(getTimeHorizonQuestion(data.step1.lifePhase));
  }
  
  // 4. Volatilitäts-Toleranz (bei höherem Vermögen oder Investment-Erfahrung)
  if (netWorth > 10000 || isExperienced) {
    questions.push(getVolatilityToleranceQuestion(hasStressFeeling));
  }
  
  // 5. Opportunitäts-Frage (bei Vermögensaufbau-Ziel und positiver Sparrate)
  if (data.step1.goals.wealth && savingsRate > 0.1) {
    questions.push(getOpportunityQuestion(savingsRate, isSecurityOriented));
  }
  
  // 6. Notfall-Szenario (bei niedriger Liquidität oder Stress-Gefühl)
  const emergencyBuffer = expenses > 0 ? assets / expenses : 0;
  if (emergencyBuffer < 6 || hasStressFeeling) {
    questions.push(getEmergencyScenarioQuestion(emergencyBuffer));
  }
  
  // 7. Komplexitäts-Frage (bei niedrigem Finanzwissen oder Komplexitäts-Gefühl)
  if (hasLowKnowledge || hasComplexityFeeling) {
    questions.push(getComplexityPreferenceQuestion());
  }
  
  // 8. Immobilien-spezifische Frage (bei Immobilien-Ziel)
  if (data.step1.goals.realEstate) {
    questions.push(getRealEstateRiskQuestion(data.step1.lifePhase));
  }
  
  // 9. Altersvorsorge-spezifische Frage (bei Altersvorsorge-Ziel mit hoher Priorität)
  if (data.step1.goals.retirement && data.step1.goalDetails.retirement.priority > 60) {
    questions.push(getRetirementRiskQuestion(data.step1.lifePhase, data.step3.retirementConfidence));
  }
  
  // 10. Diversifikations-Frage (bei Experten oder höherem Vermögen)
  if (isExperienced || netWorth > 50000) {
    questions.push(getDiversificationQuestion());
  }
  
  return questions.slice(0, 2);
}

function getLossAversionQuestion(netWorth: number): RiskQuestion {
  const lossAmount = netWorth > 50000 ? "5.000" : netWorth > 10000 ? "1.000" : "500";
  
  return {
    id: "loss_aversion",
    question: `Was wiegt für Sie emotional schwerer: Ein Verlust von ${lossAmount} € oder ein entgangener Gewinn von ${lossAmount} €?`,
    category: "loss_aversion",
    options: [
      {
        value: "loss_heavy",
        title: `Der Schmerz über ${lossAmount} € Verlust`,
        description: "Einen Verlust zu realisieren, fühlt sich deutlich schlechter an als die Freude über einen gleich hohen Gewinn.",
        riskScore: 20
      },
      {
        value: "balanced",
        title: "Beides wiegt etwa gleich",
        description: "Ich betrachte Gewinne und Verluste rational. Beides hat für mich ähnliches Gewicht.",
        riskScore: 50
      },
      {
        value: "gain_focus",
        title: `Die Chance auf ${lossAmount} € Gewinn`,
        description: "Potenzielle Gewinne motivieren mich mehr als die Angst vor Verlusten mich hemmt.",
        riskScore: 75
      }
    ]
  };
}

function getRegretAversionQuestion(isExperienced: boolean): RiskQuestion {
  return {
    id: "regret_aversion",
    question: "Was würden Sie im Nachhinein mehr bereuen?",
    category: "regret_aversion",
    options: [
      {
        value: "missed_opportunity",
        title: "Eine große Chance verpasst zu haben",
        description: isExperienced 
          ? "Ich würde mich mehr ärgern, nicht investiert zu haben, wenn eine Anlage stark steigt."
          : "Es würde mich frustrieren, wenn ich von einer guten Gelegenheit nicht profitiert hätte.",
        riskScore: 70
      },
      {
        value: "depends_on_situation",
        title: "Kommt auf die Situation an",
        description: "Beides kann ich bereuen, je nachdem wie gut ich informiert war und wie die Umstände waren.",
        riskScore: 50
      },
      {
        value: "money_lost",
        title: "Geld durch eine Fehlinvestition verloren zu haben",
        description: "Einen tatsächlichen Verlust zu erleiden, würde mich emotional stärker belasten.",
        riskScore: 25
      }
    ]
  };
}

function getTimeHorizonQuestion(lifePhase: string): RiskQuestion {
  const isYounger = lifePhase === "Berufseinsteiger" || lifePhase === "Karriere-Aufbau";
  
  return {
    id: "time_horizon",
    question: "Ihr langfristiges Investment-Portfolio schwankt stark über mehrere Monate. Wie gehen Sie damit um?",
    category: "time_horizon",
    options: [
      {
        value: "sell_partial",
        title: "Ich reduziere meine Position teilweise",
        description: "Starke Volatilität macht mich nervös. Ich sichere einen Teil ab und warte die Entwicklung ab.",
        riskScore: 30
      },
      {
        value: "hold_position",
        title: "Ich bleibe voll investiert",
        description: isYounger 
          ? "Kurzfristige Schwankungen sind normal. Bei meinem langen Anlagehorizont wird sich das ausgleichen."
          : "Ich halte an meiner langfristigen Strategie fest, auch wenn es zwischenzeitlich unangenehm ist.",
        riskScore: 60
      },
      {
        value: "buy_more",
        title: "Ich kaufe bei Tiefständen nach",
        description: "Schwankungen sind Chancen. Ich nutze niedrigere Kurse, um meine Position auszubauen.",
        riskScore: 85
      },
      {
        value: "sell_all",
        title: "Ich steige komplett aus",
        description: "So viel Unsicherheit möchte ich nicht. Ich warte auf stabilere Zeiten.",
        riskScore: 10
      }
    ]
  };
}

function getVolatilityToleranceQuestion(hasStress: boolean): RiskQuestion {
  return {
    id: "volatility_tolerance",
    question: "Wie fühlen Sie sich, wenn Ihr Portfolio innerhalb eines Jahres um 15% schwankt (sowohl nach oben als auch nach unten)?",
    category: "volatility",
    options: [
      {
        value: "very_uncomfortable",
        title: "Sehr unwohl",
        description: hasStress
          ? "Solche Schwankungen bereiten mir schlaflose Nächte. Ich bevorzuge deutlich stabilere Anlagen."
          : "Das ist mir zu unruhig. Ich möchte mich nicht ständig sorgen müssen.",
        riskScore: 15
      },
      {
        value: "somewhat_uncomfortable",
        title: "Etwas unwohl, aber akzeptabel",
        description: "Es ist nicht angenehm, aber wenn die langfristige Aussicht stimmt, kann ich damit leben.",
        riskScore: 40
      },
      {
        value: "neutral",
        title: "Neutral – gehört dazu",
        description: "Schwankungen sind normal bei Investments. Sie lassen mich emotional kalt.",
        riskScore: 65
      },
      {
        value: "excited",
        title: "Positiv – das sind Chancen",
        description: "Volatilität bedeutet Opportunitäten. Ich freue mich über Bewegung im Markt.",
        riskScore: 90
      }
    ]
  };
}

function getOpportunityQuestion(savingsRate: number, isSecurityOriented: boolean): RiskQuestion {
  const investmentPercentage = savingsRate > 0.3 ? "30%" : "20%";
  
  return {
    id: "opportunity_cost",
    question: `Eine einmalige Investitionschance erfordert ${investmentPercentage} Ihres aktuellen Sparguthabens. Das Risiko ist erhöht, aber die Renditechancen sind überdurchschnittlich. Wie entscheiden Sie?`,
    category: "opportunity",
    options: [
      {
        value: "decline",
        title: "Ich lehne ab",
        description: isSecurityOriented
          ? "Meine Sicherheit geht vor. Ich bleibe bei meiner bewährten Strategie."
          : "Das Risiko erscheint mir zu hoch für den potenziellen Gewinn.",
        riskScore: 20
      },
      {
        value: "research_first",
        title: "Ich recherchiere gründlich",
        description: "Ich würde mir Zeit nehmen, die Chance zu analysieren und ggf. Experten konsultieren, bevor ich entscheide.",
        riskScore: 45
      },
      {
        value: "small_position",
        title: "Ich investiere einen kleineren Betrag",
        description: `Statt ${investmentPercentage} investiere ich nur 5-10%, um das Risiko zu streuen.`,
        riskScore: 60
      },
      {
        value: "full_investment",
        title: "Ich nutze die volle Chance",
        description: `Ich investiere die vollen ${investmentPercentage}. Wer nicht wagt, der nicht gewinnt.`,
        riskScore: 85
      }
    ]
  };
}

function getEmergencyScenarioQuestion(emergencyBuffer: number): RiskQuestion {
  const hasLowBuffer = emergencyBuffer < 3;
  
  return {
    id: "emergency_scenario",
    question: "Ein unerwarteter Notfall (z.B. Autoreparatur, kaputte Waschmaschine) erfordert 2.000 €. Wie gehen Sie vor?",
    category: "emergency",
    options: [
      {
        value: "use_emergency_fund",
        title: "Ich nutze meinen Notfallfonds",
        description: hasLowBuffer
          ? "Ich hätte genau dafür Rücklagen gebildet, auch wenn sie dann erstmal aufgebraucht sind."
          : "Genau dafür habe ich Rücklagen. Das ist kein Problem für mich.",
        riskScore: hasLowBuffer ? 40 : 60
      },
      {
        value: "sell_investments",
        title: "Ich verkaufe Investments",
        description: "Ich würde einen Teil meiner Anlagen liquidieren, um die Kosten zu decken.",
        riskScore: 45
      },
      {
        value: "credit_or_loan",
        title: "Ich nehme einen Kredit auf",
        description: "Ich würde das über einen Kleinkredit oder Dispo finanzieren, um meine Rücklagen nicht anzutasten.",
        riskScore: 25
      },
      {
        value: "payment_plan",
        title: "Ich verhandle Ratenzahlung",
        description: "Ich würde versuchen, eine Ratenzahlung zu vereinbaren und es aus laufenden Einkünften zu begleichen.",
        riskScore: 35
      }
    ]
  };
}

function getComplexityPreferenceQuestion(): RiskQuestion {
  return {
    id: "complexity_preference",
    question: "Bei der Geldanlage: Was ist Ihnen wichtiger?",
    category: "volatility",
    options: [
      {
        value: "simplicity",
        title: "Einfachheit und Verständlichkeit",
        description: "Ich möchte genau verstehen, worin ich investiere. Komplexe Produkte sind mir suspekt.",
        riskScore: 35
      },
      {
        value: "guided_complexity",
        title: "Begleitet auch komplexere Strategien",
        description: "Mit guter Beratung und Erklärung bin ich offen für anspruchsvollere Anlageformen.",
        riskScore: 55
      },
      {
        value: "performance_focus",
        title: "Performance, auch wenn komplex",
        description: "Die Rendite zählt. Wenn ein komplexes Produkt bessere Ergebnisse verspricht, bin ich dabei.",
        riskScore: 70
      }
    ]
  };
}

function getRealEstateRiskQuestion(lifePhase: string): RiskQuestion {
  const isYounger = lifePhase === "Berufseinsteiger" || lifePhase === "Karriere-Aufbau";
  
  return {
    id: "real_estate_risk",
    question: "Die Immobilienpreise in Ihrer Wunschregion fallen um 15%. Was tun Sie?",
    category: "opportunity",
    options: [
      {
        value: "wait_for_stability",
        title: "Ich warte auf Stabilisierung",
        description: "Ich beobachte den Markt weiter und warte, bis sich die Preise wieder gefangen haben.",
        riskScore: 30
      },
      {
        value: "buy_now",
        title: "Ich kaufe jetzt",
        description: isYounger
          ? "Das ist meine Chance auf einen günstigeren Einstieg. Bei meinem langen Horizont ist das optimal."
          : "Ein Preisrückgang ist eine gute Gelegenheit. Immobilien sind langfristig stabil.",
        riskScore: 70
      },
      {
        value: "reconsider_plan",
        title: "Ich überdenke meinen Plan",
        description: "Vielleicht ist jetzt nicht der richtige Zeitpunkt für eine Immobilie. Ich prüfe Alternativen.",
        riskScore: 40
      },
      {
        value: "negotiate_harder",
        title: "Ich verhandle härter",
        description: "Ich nutze die Marktsituation, um noch bessere Konditionen auszuhandeln.",
        riskScore: 60
      }
    ]
  };
}

function getRetirementRiskQuestion(lifePhase: string, confidence: number): RiskQuestion {
  const isCloseToRetirement = lifePhase === "Vor dem Ruhestand" || lifePhase === "Im Ruhestand";
  const hasLowConfidence = confidence < 40;
  
  return {
    id: "retirement_risk",
    question: isCloseToRetirement
      ? "Sie sind kurz vor der Rente. Wie legen Sie Ihre Altersvorsorge an?"
      : "Wie möchten Sie für Ihre Altersvorsorge investieren?",
    category: "time_horizon",
    options: [
      {
        value: "very_safe",
        title: "Maximal sicher",
        description: hasLowConfidence
          ? "Ich setze auf sichere Anlagen wie Festgeld und Anleihen, auch wenn die Rendite niedrig ist."
          : "Sicherheit ist mir bei der Altersvorsorge am wichtigsten. Rendite ist zweitrangig.",
        riskScore: 15
      },
      {
        value: "conservative_mix",
        title: "Konservativ gemischt",
        description: "Überwiegend sichere Anlagen, mit einem kleinen Anteil renditeorientierter Investments (z.B. 70/30).",
        riskScore: 40
      },
      {
        value: "balanced_mix",
        title: "Ausgewogen gemischt",
        description: isCloseToRetirement
          ? "Eine Balance aus Sicherheit und Wachstum (z.B. 50/50), um noch von Renditechancen zu profitieren."
          : "Ein ausgewogener Mix aus sicheren und wachstumsorientierten Anlagen (z.B. 50/50 oder 60/40).",
        riskScore: 55
      },
      {
        value: "growth_oriented",
        title: "Wachstumsorientiert",
        description: isCloseToRetirement
          ? "Auch kurz vor der Rente setze ich auf Wachstum. Die Rente dauert lang genug für Erholung."
          : "Bei einem langen Anlagehorizont setze ich stärker auf Aktien und wachstumsorientierte Anlagen.",
        riskScore: 75
      }
    ]
  };
}

function getDiversificationQuestion(): RiskQuestion {
  return {
    id: "diversification",
    question: "Sie haben die Möglichkeit, 10.000 € zu investieren. Wie gehen Sie vor?",
    category: "volatility",
    options: [
      {
        value: "single_safe_investment",
        title: "Eine sichere Anlage",
        description: "Ich lege alles in ein sicheres Produkt an (z.B. Festgeld, Staatsanleihen).",
        riskScore: 20
      },
      {
        value: "broad_diversification",
        title: "Breit diversifiziert",
        description: "Ich streue über verschiedene Anlageklassen: Aktien-ETFs, Anleihen, vielleicht etwas Immobilien-Fonds.",
        riskScore: 55
      },
      {
        value: "focused_portfolio",
        title: "Fokussiertes Portfolio",
        description: "Ich konzentriere mich auf 2-3 aussichtsreiche Bereiche, in die ich wirklich Vertrauen habe.",
        riskScore: 70
      },
      {
        value: "single_opportunity",
        title: "Eine große Chance",
        description: "Wenn ich eine überzeugende Gelegenheit sehe, investiere ich voll dort hinein.",
        riskScore: 90
      }
    ]
  };
}
