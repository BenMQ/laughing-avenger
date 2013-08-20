SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `laughing_avenger` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `laughing_avenger` ;

-- -----------------------------------------------------
-- Table `laughing_avenger`.`post`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`post` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`post` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'the primary key\n' ,
  `title` VARCHAR(255) NOT NULL ,
  `content` TEXT NULL ,
  `owner_id` INT NOT NULL COMMENT 'ID of the user that posted this' ,
  `type` INT NOT NULL COMMENT '0 for question, 1 for answer' ,
  `parent_id` INT UNSIGNED NULL DEFAULT NULL COMMENT 'NULL for question, id of parent question for answers' ,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'time created' ,
  `votecount` INT NOT NULL DEFAULT 0 COMMENT 'upvote minus downvote' ,
  `close_time` DATETIME NULL DEFAULT NULL COMMENT 'NULL for open questions\n' ,
  `accepted_answer` INT UNSIGNED NULL DEFAULT NULL COMMENT 'id for the answer accepted' ,
  PRIMARY KEY (`id`) ,
  INDEX `question_answer_postid_idx` (`parent_id` ASC) ,
  INDEX `post_accepted_answer_id_idx` (`accepted_answer` ASC) ,
  CONSTRAINT `post_parentid_id`
    FOREIGN KEY (`parent_id` )
    REFERENCES `laughing_avenger`.`post` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_accepted_answer_id`
    FOREIGN KEY (`accepted_answer` )
    REFERENCES `laughing_avenger`.`post` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `laughing_avenger`.`vote`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`vote` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`vote` (
  `user_id` INT UNSIGNED NOT NULL ,
  `post_id` INT UNSIGNED NOT NULL ,
  `type` TINYINT NULL COMMENT '1 for upvote, 0 for downvote' ,
  PRIMARY KEY (`user_id`, `post_id`) ,
  INDEX `vote_post_id_id_idx` (`post_id` ASC) ,
  CONSTRAINT `vote_post_id_id`
    FOREIGN KEY (`post_id` )
    REFERENCES `laughing_avenger`.`post` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `laughing_avenger`.`comment`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `laughing_avenger`.`comment` ;

CREATE  TABLE IF NOT EXISTS `laughing_avenger`.`comment` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `user_id` INT UNSIGNED NOT NULL ,
  `post_id` INT UNSIGNED NOT NULL ,
  `content` TEXT NOT NULL ,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `comment_post_id_id_idx` (`post_id` ASC) ,
  CONSTRAINT `comment_post_id_id`
    FOREIGN KEY (`post_id` )
    REFERENCES `laughing_avenger`.`post` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `laughing_avenger` ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
