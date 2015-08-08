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

CREATE TABLE `cgdb`.`regroupement` (
  `idRegroupement` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '',
  `Nom` LONGTEXT NULL COMMENT '',
  `Categorie_idCategorie` INT UNSIGNED NOT NULL COMMENT '',
  PRIMARY KEY (`idRegroupement`)  COMMENT '',
  UNIQUE INDEX `idRegroupement_UNIQUE` (`idRegroupement` ASC)  COMMENT '');

ALTER TABLE `cgdb`.`regroupement` 
ADD INDEX `categorie_idx` (`Categorie_idCategorie` ASC)  COMMENT '';
ALTER TABLE `cgdb`.`regroupement` 
ADD CONSTRAINT `categorie`
  FOREIGN KEY (`Categorie_idCategorie`)
  REFERENCES `cgdb`.`categorie` (`idCategorie`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `cgdb`.`regroupement` 
ADD COLUMN `Display` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '' AFTER `Categorie_idCategorie`;

ALTER TABLE `cgdb`.`produit` 
ADD COLUMN `regroupement_idRegroupement` INT UNSIGNED NULL DEFAULT NULL COMMENT '' AFTER `display`;