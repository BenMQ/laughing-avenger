SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `laughing_avenger` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `laughing_avenger` ;

-- -----------------------------------------------------
-- Table `laughing_avenger`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`user` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`user` (
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'fbid of the user' ,
  `fb_username` VARCHAR(100) NULL ,
  `fbpic_url` VARCHAR(255) NULL ,
  `name` VARCHAR(100) NULL ,
  PRIMARY KEY (`user_id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `laughing_avenger`.`module`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`module` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`module` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `title` VARCHAR(100) NOT NULL ,
  `description` TEXT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `laughing_avenger`.`post`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`post` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`post` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'the primary key\n' ,
  `title` VARCHAR(255) NOT NULL ,
  `content` TEXT NULL ,
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID of the user that posted this' ,
  `type` INT NOT NULL COMMENT '0 for question, 1 for answer' ,
  `parent_id` INT UNSIGNED NULL DEFAULT NULL COMMENT 'NULL for question, id of parent question for answers' ,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'time created' ,
  `module_id` INT UNSIGNED NULL ,
  `votecount` INT NOT NULL DEFAULT 0 COMMENT 'upvote minus downvote' ,
  `close_time` TIMESTAMP NULL DEFAULT NULL COMMENT 'NULL for open questions\n' ,
  `accepted_answer` INT UNSIGNED NULL DEFAULT NULL COMMENT 'id for the answer accepted' ,
  `anonymous` TINYINT NOT NULL DEFAULT 0 COMMENT '1 for anonymous, 0 for public' ,
  PRIMARY KEY (`id`) ,
  INDEX `question_answer_postid_idx` (`parent_id` ASC) ,
  INDEX `post_accepted_answer_id_idx` (`accepted_answer` ASC) ,
  INDEX `post_user_user_id_idx` (`owner_id` ASC) ,
  CONSTRAINT `post_parentid_id`
    FOREIGN KEY (`parent_id` )
    REFERENCES `laughing_avenger`.`post` (`id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `post_accepted_answer_id`
    FOREIGN KEY (`accepted_answer` )
    REFERENCES `laughing_avenger`.`post` (`id` )
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  CONSTRAINT `post_user_user_id`
    FOREIGN KEY (`owner_id` )
    REFERENCES `laughing_avenger`.`user` (`user_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `post_module_id`
    FOREIGN KEY (`id` )
    REFERENCES `laughing_avenger`.`module` (`id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `laughing_avenger`.`vote`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`vote` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`vote` (
  `user_id` BIGINT UNSIGNED NOT NULL ,
  `post_id` INT UNSIGNED NOT NULL ,
  `type` TINYINT NULL COMMENT '1 for upvote, -1 for downvote' ,
  PRIMARY KEY (`user_id`, `post_id`) ,
  INDEX `vote_post_id_id_idx` (`post_id` ASC) ,
  INDEX `vote_user_user_id_idx` (`user_id` ASC) ,
  CONSTRAINT `vote_post_id_id`
    FOREIGN KEY (`post_id` )
    REFERENCES `laughing_avenger`.`post` (`id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `vote_user_user_id`
    FOREIGN KEY (`user_id` )
    REFERENCES `laughing_avenger`.`user` (`user_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `laughing_avenger`.`comment`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`comment` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`comment` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `user_id` BIGINT UNSIGNED NOT NULL ,
  `post_id` INT UNSIGNED NOT NULL ,
  `content` TEXT NOT NULL ,
  `timestamp` TIMESTAMP NOT NULL ,
  `anonymous` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '1 for anonymous, 0 for public' ,
  PRIMARY KEY (`id`) ,
  INDEX `comment_post_id_id_idx` (`post_id` ASC) ,
  INDEX `comment_user_user_id_idx` (`user_id` ASC) ,
  CONSTRAINT `comment_post_id_id`
    FOREIGN KEY (`post_id` )
    REFERENCES `laughing_avenger`.`post` (`id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `comment_user_user_id`
    FOREIGN KEY (`user_id` )
    REFERENCES `laughing_avenger`.`user` (`user_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `laughing_avenger`.`enrollment`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`enrollment` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`enrollment` (
  `user_id` BIGINT UNSIGNED NOT NULL ,
  `module_id` INT UNSIGNED NOT NULL ,
  `is_manager` TINYINT NOT NULL DEFAULT 0 COMMENT '0 for normal enrollment, 1 for manager' ,
  PRIMARY KEY (`user_id`, `module_id`) ,
  INDEX `enrollment_user_user_id_idx` (`user_id` ASC) ,
  INDEX `enrollment_module_mod_id_idx` (`module_id` ASC) ,
  CONSTRAINT `enrollment_user_user_id`
    FOREIGN KEY (`user_id` )
    REFERENCES `laughing_avenger`.`user` (`user_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `enrollment_module_mod_id`
    FOREIGN KEY (`module_id` )
    REFERENCES `laughing_avenger`.`module` (`id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `laughing_avenger` ;
USE `laughing_avenger`;

DELIMITER $$

USE `laughing_avenger`$$
DROP TRIGGER IF EXISTS `laughing_avenger`.`vote_BDEL` $$
USE `laughing_avenger`$$


CREATE TRIGGER `vote_BDEL` BEFORE DELETE ON vote FOR EACH ROW
-- Edit trigger body code below this line. Do not edit lines above this one
	UPDATE post p SET p.votecount=p.votecount - OLD.type
	WHERE p.id = OLD.post_id;

$$


USE `laughing_avenger`$$
DROP TRIGGER IF EXISTS `laughing_avenger`.`vote_AUPD` $$
USE `laughing_avenger`$$


CREATE TRIGGER `vote_AUPD` AFTER UPDATE ON vote FOR EACH ROW
-- Edit trigger body code below this line. Do not edit lines above this one
	UPDATE post p SET p.votecount=p.votecount + NEW.type - OLD.type
	WHERE p.id = NEW.post_id
$$


USE `laughing_avenger`$$
DROP TRIGGER IF EXISTS `laughing_avenger`.`vote_AINS` $$
USE `laughing_avenger`$$


CREATE TRIGGER `vote_AINS` AFTER INSERT ON vote FOR EACH ROW
-- Edit trigger body code below this line. Do not edit lines above this one
	UPDATE post p SET p.votecount=p.votecount + NEW.type
	WHERE p.id = NEW.post_id; 
$$


DELIMITER ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
