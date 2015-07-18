ALTER TABLE `cgdb`.`terminal`
CHANGE COLUMN `Actif` `Actif` INT NOT NULL DEFAULT 1 COMMENT '' ;

ALTER TABLE `cgdb`.`categorie`
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Nom`;

ALTER TABLE `cgdb`.`client`
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `TVA`;

ALTER TABLE `cgdb`.`commande`
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Terminal_idTerminal`;


ALTER TABLE `cgdb`.`magasin`
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Adresse`;

ALTER TABLE `cgdb`.`produit`
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Categorie_idCategorie`;


ALTER TABLE `cgdb`.`produitcustom`
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Categorie_idCategorie`;

ALTER TABLE `cgdb`.`vendeuse`
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Magasin_idMagasin`;
