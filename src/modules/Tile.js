import Phaser from 'phaser';
import Button from "../components/Button.js";
import config from "../config.js";
import CST from "../cst.js";


class Tile extends Phaser.GameObjects.Sprite {
  constructor({ scene, x, y, frame }) {
    super(scene, x, y, 'grass', frame);

    this.entity = null;

    this.setInteractive();

    this.on('pointerup', event => {
      this.showPopup();
    });

    this.scene.anims.create({
      key: 'grass',
      frames: [{ key: 'grass', frame: 0 }],
      frameRate: 1
    });

    this.scene.anims.create({
      key: 'land',
      frames: [{ key: 'grass', frame: 1 }],
      frameRate: 1
    });

    this.anims.play('grass');
  }

  showPopup() {
    this.scene.tiles.children.iterate(tile => tile.popup && tile.destroyPopup());

    if (this.entity) {
      this.entity.showPopup();
      this.popup = this.entity.popup;
      return;
    }

    this.popup = new Phaser.GameObjects.Container(this.scene, this.x, this.y - this.displayHeight / 2);

    const list = this.scene.barn.getAnimalList().concat(this.scene.barn.getPlantList());

    let i = 0;
    list.forEach(id => {
      const entity = config.entities.find(entity => entity.id === id);

      const btn = new Button({
        scene: this.scene,
        x: 0,
        y: -i * config.textLineHeight,
        text: entity.name,
        style: {
          backgroundColor: '#ffd260'
        },
        clickCallBack: () => {
          this.placeEntity(entity);
          this.destroyPopup();
        }
      });
      btn.setOrigin(0.5, 1);

      this.popup.add(btn);
      i++;
    });

    if (!list.length) {
      this.popup.add(new Phaser.GameObjects.Text(
          this.scene,
          0,
          -i * config.textLineHeight,
          'nothing',
          config.basicTextStyle
      ).setOrigin(0.5, 1));
      i++;
    }

    this.popup.add(new Phaser.GameObjects.Text(
        this.scene,
        0,
        -i * config.textLineHeight,
        'Place',
        config.basicTextStyle
    ).setOrigin(0.5, 1));

    this.scene.add.existing(this.popup);
  }

  destroyPopup() {
    this.popup.destroy();
    this.popup = null;

    if (this.entity) {
      this.entity.popup = null;
    }
  }

  placeEntity(entity) {
    if (this.scene.barn.getQuantity(entity.id) > 0) {
      this.scene.barn.take(entity.id, 1);

      const Entity = entity.class;
      const e = new Entity({ scene: this.scene, x: this.x, y: this.y, tile: this, entity });

      this.entity = this.scene.add.existing(e);

      if (entity.type === CST.ENTITIES.TYPES.PLANT) {
        this.anims.play('land');
      } else {
        this.anims.play('grass');
      }
    }
  }

  static addTileGrid({ scene, width = 8, height = 8, offsetX = 0, offsetY = 0 }) {
    const tiles = scene.add.group();

    for (let i = 0; i < width * height; i++) {
      tiles.add(new Tile({ scene }), true);
    }

    Phaser.Actions.GridAlign(tiles.getChildren(), {
      width,
      height,
      cellWidth: 64,
      cellHeight: 64,
      position: Phaser.Display.Align.CENTER,
      x: 32 + offsetX,
      y: 32 + offsetY
    });

    const moveQraphics = scene.add.graphics();
    const clickQraphics = scene.add.graphics();

    tiles.children.iterate(tile => {
      tile.on('pointerover', event => {
        moveQraphics.lineStyle(2, 0xffff00);
        moveQraphics.strokeRect(
            tile.x - tile.displayWidth / 2,
            tile.y - tile.displayHeight / 2,
            tile.displayWidth,
            tile.displayHeight
        );
      });

      tile.on('pointerout', event => {
        moveQraphics.clear();
      });

      tile.on('pointerup', () => {
        clickQraphics.clear();
        clickQraphics.lineStyle(2, 0xffff00);
        clickQraphics.strokeRect(
            tile.x - tile.displayWidth / 2,
            tile.y - tile.displayHeight / 2,
            tile.displayWidth,
            tile.displayHeight
        );
      })
    });

    return tiles;
  }
}

export default Tile;
