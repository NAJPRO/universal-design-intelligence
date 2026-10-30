# Mission 011 — Audit initial et décision minimale

Audit réalisé avant modification des contrats, du moteur ou du skill (2026-10-30).

## Capacités existantes

- `packages/knowledge/src/component-schemas.ts` : spécifications strictes 1.0, `revision`, tableaux `responsive` (condition/restructure/informations/focus), variants, contrôles avec méthode/sévérité/preuve. Aucune extension de schéma nécessaire.
- `component-records.ts` : trois familles et une composition, catalogue 1.0.0/révision 1. Le tableau propose déjà défilement horizontal ou lignes empilées, et conserve identité/valeurs/actions. Le champ de découverte demande une action fréquente visible, mais ne définit pas comment vérifier son accès mobile. Filtres : résumé/panneau ; formulaire : groupes/actions accessibles ; composition : détail déplacé, propriétaire du focus.
- Règles existantes `UDI-RSP-004`, `UDI-ANT-009`, `UDI-DAT-004`, motif `PAT-RESPONSIVE-TABLE` : privilégient lisibilité, identité et informations prioritaires. Les enrichir modifierait les sorties historiques exactes sans nécessité ; conserver ces enregistrements.
- `packages/core/src/components.ts` : sélection déterministe par preuves de tâche/composant, sortie 2.1 bornée, inspection complète à la demande. Les résumés contiennent but/hiérarchie mais aucune décision responsive directement exploitable. Le contenu et la version du catalogue entrent déjà dans l'empreinte des curseurs.
- Contrôles existants : intégrité références/états/variants, sélection/conflits/budgets, sorties 1.0/2.0 et paquet autonome hors ligne. Aucun scanner de navigateur dans le runtime. Les contrôles de contrat sont des instructions, pas des résultats de conformité.
- Mission 010 : les trois sorties rendent les actions et colonnes suivantes distantes sur mobile. C conserve une barre de tableau vide dans les états sans lignes. Ses preuves figées sont hors du périmètre d'édition.
- `skills/udi-design/references/design-quality.md` : checklist commune déjà distribuée par l'installateur. Elle peut accueillir la politique transversale (page/table/navigation/filtres/carrousel/dialogue/débordement) sans nouvel actif, famille ou mécanisme de retrieval.

## Changements retenus

1. Réviser uniquement le catalogue de contrats à 1.1.0/révision 2 : choix comparaison ou consultation individuelle, identité/état/permissions/actions, adaptation par tâche et place disponible plutôt que breakpoint universel, scroll et contrôles concrets. Garder les IDs, schémas, slots et états.
2. Exposer une courte décision responsive dans le résumé 2.1 existant ; toujours inspecter les détails nécessaires. Préserver la structure du format, les gates et l'atomicité. Les sorties historiques 1.0/2.0 doivent rester identiques.
3. Écrire une politique originale dans la référence qualité existante, avec défauts certains et avertissements à vérifier. Ne pas confondre préférence navigateur/OS de scrollbar et obligation d'une barre toujours peinte.
4. Vérifier par tests de référence/compatibilité, scénarios de défauts et navigateur réel. Utiliser un petit détecteur uniquement dans le benchmark, fondé sur preuves déclarées et observations mesurées, sans prétendre à un audit automatique général de l'accessibilité.
5. Figer avant/après pour les mêmes contextes et créer des représentations comparatives contrôlées par la fixture. Ce ne sont pas des générations indépendantes d'agents : l'effet causal d'un changement de connaissances sur un nouvel agent reste non mesuré. Aucun résultat esthétique ne sera attribué à UDI sur cette base.

## Préservation et provenance

La copie du runtime d'avant mission, du catalogue et de la référence qualité est conservée sous `benchmarks/mission011/baseline/`. Tous les fichiers Mission 010 sont hachés avant travail. Aucun changement de Git, dépendance, publication ou projet utilisateur. Contenu ajouté original UDI/MIT ; les sources W3C/MDN sont des références consultées, sans reproduction de code, prose ou actifs (voir rapport final).
