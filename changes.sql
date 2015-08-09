
ALTER TABLE `cgdb`.`Terminal` 
CHANGE COLUMN `Actif` `Actif` INT NOT NULL DEFAULT 1 COMMENT '' ;


ALTER TABLE `cgdb`.`Categorie` 
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Nom`;

ALTER TABLE `cgdb`.`Client` 
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `TVA`;

ALTER TABLE `cgdb`.`Commande` 
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Terminal_idTerminal`;


ALTER TABLE `cgdb`.`Magasin` 
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Adresse`;

ALTER TABLE `cgdb`.`Produit` 
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Categorie_idCategorie`;


ALTER TABLE `cgdb`.`ProduitCustom` 
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Categorie_idCategorie`;

ALTER TABLE `cgdb`.`Vendeuse` 
ADD COLUMN `display` INT NOT NULL DEFAULT 1 COMMENT '' AFTER `Magasin_idMagasin`;

UPDATE Commande SET Livraison='2015-08-18 12:00:00' WHERE idCommande < 90;


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
